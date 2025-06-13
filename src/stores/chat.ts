import { defineStore } from "pinia";
import api from "@/api/chat";
import { useUserStore } from "./user";

// 消息接口更新，匹配后端结构
export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  messageType: "text" | "image" | "file";
  // 前端临时状态
  pending?: boolean; // 消息是否正在发送
  failed?: boolean; // 消息是否发送失败
  // 额外展示信息
  sender?: string; // 发送者名称
  avatar?: string; // 发送者头像
  // 新增字段
  fileUrl?: string | null; // 文件URL（图片等）
  replyTo?: string | null; // 回复消息ID
  isDeleted?: boolean; // 消息是否已删除
  updatedAt?: string; // 更新时间
  // 客户端状态
  isSelf?: boolean;
  // 新消息标记
  isNewReceived?: boolean;
  isGroupMessage?: boolean; // 是否为群组消息
  forceRender?: boolean; // 强制渲染标记
  isAnonymous?: boolean; // 是否为匿名消息
  anonymousName?: string;
}

// 后端消息结构
export interface BackendMessage {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
    anonymousName?: string;
  };
  content: string;
  contentType: "text" | "image";
  fileUrl: string | null;
  recipient: string;
  recipientModel: string;
  readBy: Array<{
    user: string;
    readAt: string;
    _id: string;
  }>;
  isDeleted: boolean;
  replyTo: string | null;
  createdAt: string;
  updatedAt: string;
  isAnonymous?: boolean;
  anonymousName?: string;
}

export interface ChatState {
  connected: boolean; // WebSocket连接状态
  currentChatId: string | null; // 当前聊天的用户ID
  messages: Record<string, Message[]>; // 所有聊天消息，以聊天对象ID为键
  typingUsers: Record<string, boolean>; // 正在输入状态的用户
  unreadCounts: Record<string, number>; // 未读消息计数
  chatLoading: boolean; // 加载历史消息状态
}

export const useChatStore = defineStore("chat", {
  state: (): ChatState => ({
    connected: false,
    currentChatId: null,
    messages: {},
    typingUsers: {},
    unreadCounts: {},
    chatLoading: false,
  }),

  getters: {
    // 获取当前聊天的消息
    currentMessages(state) {
      if (!state.currentChatId) return [];
      return state.messages[state.currentChatId] || [];
    },

    // 检查用户是否正在输入
    isUserTyping: (state) => (userId: string) => {
      return !!state.typingUsers[userId];
    },

    // 获取未读消息数
    unreadCount: (state) => (userId: string) => {
      return state.unreadCounts[userId] || 0;
    },

    // 获取总未读消息数
    totalUnreadCount(state) {
      return Object.values(state.unreadCounts).reduce(
        (sum, count) => sum + count,
        0
      );
    },

    // 获取用户的所有消息
    getUserMessages: (state) => (userId: string) => {
      return state.messages[userId] || [];
    },

    // 获取最后一条消息
    getLastMessage: (state) => (userId: string) => {
      const messages = state.messages[userId] || [];
      return messages.length > 0 ? messages[messages.length - 1] : null;
    },
  },

  actions: {
    // 设置WebSocket连接状态
    setConnectionState(connected: boolean) {
      this.connected = connected;
    },

    // 设置当前聊天ID
    setCurrentChat(userId: string | null) {
      this.currentChatId = userId;

      // 将所有消息设为已读
      if (userId && this.messages[userId]) {
        this.messages[userId].forEach((msg: Message) => {
          if (msg.senderId === userId && !msg.read) {
            msg.read = true;
          }
        });

        // 重置未读消息计数
        this.unreadCounts[userId] = 0;
      }
    },

    // 添加新消息
    addMessage(message: Message) {
      // 确定正确的聊天ID
      let chatId;

      // 根据消息是否有isGroupMessage标志决定使用哪个ID作为聊天ID
      if (message.isGroupMessage) {
        chatId = message.receiverId; // 对于群组消息，使用receiverId (群组ID)
      } else {
        // 对于私聊消息，发送给他人的消息使用receiverId，收到的消息使用senderId
        const userId = useUserStore().userId;
        chatId =
          message.senderId === userId ? message.receiverId : message.senderId;
      }

      // 如果该聊天ID还没有消息数组，创建一个
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }

      // 检查消息是否已存在 (通过ID)
      const existingMsgById = this.messages[chatId].findIndex(
        (msg) => msg._id === message._id
      );

      // 检查是否存在相同内容的pending消息
      const existingPendingMsgIndex = this.messages[chatId].findIndex(
        (msg) =>
          msg.pending &&
          msg.content === message.content &&
          msg.senderId === message.senderId &&
          !message.pending // 只有当新消息不是pending状态时才匹配
      );

      // 如果找到了相同内容的pending消息，且当前消息不是pending状态，则替换该消息
      if (existingPendingMsgIndex !== -1 && !message.pending) {
        const pendingMsg = this.messages[chatId][existingPendingMsgIndex];
        console.log("替换pending消息:", pendingMsg, "->", message);

        // 确保匿名状态一致 - 如果pending消息是匿名的，但新消息没有匿名标记，保持匿名状态
        if (pendingMsg.isAnonymous && !message.isAnonymous) {
          console.log(
            "保持匿名状态: pending消息是匿名的，但新消息没有匿名标记"
          );
          message.isAnonymous = true;
          message.sender = useUserStore().anonymousName;
          message.avatar = "";
        }

        this.messages[chatId].splice(existingPendingMsgIndex, 1);
        // 不存在消息ID直接添加，会在下面添加
      }
      // 如果相同ID的消息已存在，更新它
      else if (existingMsgById !== -1) {
        // 更新现有消息，保留部分客户端状态
        const existingMsg = this.messages[chatId][existingMsgById];
        // 如果现有消息是pending状态，但新消息不是，则更新状态
        if (existingMsg.pending && !message.pending) {
          this.messages[chatId][existingMsgById] = {
            ...message,
            pending: false,
            failed: false,
          };
          console.log("更新消息状态:", existingMsg._id);
        }
        return; // 已处理，退出
      }

      // 消息不存在，添加新消息
      this.messages[chatId].push(message);

      // 按时间排序
      this.messages[chatId].sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // 如果不是当前聊天，增加未读计数
      if (
        chatId !== this.currentChatId &&
        message.senderId !== useUserStore().userId
      ) {
        this.unreadCounts[chatId] = (this.unreadCounts[chatId] || 0) + 1;
      }
      console.log("添加新消息", chatId, message.content);
    },

    // 更新消息
    updateMessage(message: Message) {
      // 确定正确的聊天ID
      let chatId;

      // 根据消息是否有isGroupMessage标志决定使用哪个ID作为聊天ID
      if (message.isGroupMessage) {
        chatId = message.receiverId; // 对于群组消息，使用receiverId (群组ID)
      } else {
        // 对于私聊消息，发送给他人的消息使用receiverId，收到的消息使用senderId
        const userId = useUserStore().userId;
        chatId =
          message.senderId === userId ? message.receiverId : message.senderId;
      }

      if (!this.messages[chatId]) return;

      const index = this.messages[chatId].findIndex(
        (msg) => msg._id === message._id
      );

      if (index !== -1) {
        // 更新消息内容，保留前端状态
        const pendingStatus = this.messages[chatId][index].pending;
        const failedStatus = this.messages[chatId][index].failed;

        this.messages[chatId][index] = {
          ...message,
          pending: pendingStatus,
          failed: failedStatus,
        };

        // 如果有强制渲染标志，打印日志确认
        if (message.forceRender) {
          console.log(`消息 ${message._id} 更新并设置了强制渲染标志`);

          // 移除该标志，避免重复渲染
          delete this.messages[chatId][index].forceRender;
        }
      }
    },

    // 转换后端消息格式为前端格式
    convertMessageFormat(backendMessage: BackendMessage): Message {
      const userStore = useUserStore();
      const isCurrentUser = backendMessage.sender._id === userStore.userId;
      const isGroupMessage = backendMessage.recipientModel === "groups";
      const isAnonymous = !!backendMessage.isAnonymous;
      const anonymousName = backendMessage.anonymousName ?? "匿名的袜子";
      console.log("转换消息格式", backendMessage.sender.anonymousName);
      return {
        _id: backendMessage._id,
        senderId: backendMessage.sender._id,
        receiverId: backendMessage.recipient,
        content: backendMessage.content,
        createdAt: backendMessage.createdAt,
        read: backendMessage.readBy.length > 0,
        messageType: backendMessage.contentType,
        sender: isAnonymous
          ? backendMessage.sender.username
          : backendMessage.sender.username,
        avatar: isAnonymous ? "" : backendMessage.sender.avatar,
        fileUrl: backendMessage.fileUrl,
        replyTo: backendMessage.replyTo,
        isDeleted: backendMessage.isDeleted,
        updatedAt: backendMessage.updatedAt,
        isSelf: isCurrentUser,
        isNewReceived: false,
        isGroupMessage: isGroupMessage, // 标记是否为群组消息
        isAnonymous: isAnonymous, // 匿名消息标记
        anonymousName: anonymousName,
      };
    },

    // 标记消息为已读
    markMessageAsRead(messageId: string) {
      if (!this.currentChatId) return;

      const messages = this.messages[this.currentChatId];
      if (!messages) return;

      const index = messages.findIndex((msg) => msg._id === messageId);
      if (index !== -1) {
        messages[index].read = true;
      }
    },

    // 设置用户正在输入状态
    setUserTyping({ userId, isTyping }: { userId: string; isTyping: boolean }) {
      this.typingUsers[userId] = isTyping;
    },

    // 设置消息为待处理状态（正在发送）
    setMessagePending({
      chatId,
      messageId,
      pending,
    }: {
      chatId: string;
      messageId: string;
      pending: boolean;
    }) {
      if (this.messages[chatId]) {
        const index = this.messages[chatId].findIndex(
          (msg: Message) => msg._id === messageId
        );

        if (index !== -1) {
          this.messages[chatId][index].pending = pending;
        }
      }
    },

    // 设置消息为失败状态
    messageFailure({
      chatId,
      messageId,
    }: {
      chatId: string;
      messageId: string;
    }) {
      if (this.messages[chatId]) {
        const index = this.messages[chatId].findIndex(
          (msg: Message) => msg._id === messageId
        );

        if (index !== -1) {
          this.messages[chatId][index].pending = false;
          this.messages[chatId][index].failed = true;
        }
      }
    },

    // 添加临时消息（尚未从服务器确认）
    addTempMessage(message: Message) {
      const chatId = message.receiverId;

      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }

      this.messages[chatId].push({
        ...message,
        pending: true,
      });

      // 按时间排序
      this.messages[chatId].sort((a: Message, b: Message) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    },

    // 重置聊天状态
    resetState() {
      this.connected = false;
      this.currentChatId = null;
      this.messages = {};
      this.typingUsers = {};
      this.unreadCounts = {};
      this.chatLoading = false;
    },

    // 加载聊天历史
    async loadChatHistory(userId: string) {
      if (!userId) return;

      this.chatLoading = true;

      try {
        const response = await api.getChatHistory(userId);
        console.log(response);
        if (response && response.success) {
          // 转换消息格式
          const messages = response.data.map((msg: BackendMessage) =>
            this.convertMessageFormat(msg)
          );

          // 清空当前消息（避免重复）
          this.messages[userId] = [];

          // 设置消息
          this.messages[userId] = messages;

          console.log(`已加载 ${messages.length} 条聊天历史`);

          return messages;
        } else {
          throw new Error(response.data?.message || "加载聊天历史失败");
        }
      } catch (error: any) {
        console.error("加载聊天历史失败:", error);
        throw error;
      } finally {
        this.chatLoading = false;
      }
    },

    // 切换到聊天
    async switchToChat(userId: string) {
      this.setCurrentChat(userId);
      await this.loadChatHistory(userId);
    },

    // 发送消息
    async sendMessage({
      receiverId,
      content,
      messageType = "text",
      fileUrl = null,
      replyTo = null,
    }: {
      receiverId: string;
      content: string;
      messageType?: "text" | "image";
      fileUrl?: string | null;
      replyTo?: string | null;
    }) {
      // 需要从用户状态获取当前用户ID
      const userStore = useUserStore();

      // 创建临时消息ID（后端会替换）
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 创建临时消息对象
      const tempMessage: Message = {
        _id: tempId,
        senderId: userStore.userId as string,
        receiverId,
        content,
        messageType,
        createdAt: new Date().toISOString(),
        read: false,
        pending: true,
        fileUrl,
        replyTo,
        sender: userStore.username as string,
        avatar: userStore.avatar as string,
        isSelf: userStore.userId === receiverId,
        isNewReceived: false,
      };

      // 添加临时消息到状态
      this.addTempMessage(tempMessage);

      return tempId;
    },

    // 重试发送失败的消息
    retryMessage({ chatId, messageId }: { chatId: string; messageId: string }) {
      if (!this.messages[chatId]) return;

      const index = this.messages[chatId].findIndex(
        (msg) => msg._id === messageId
      );

      if (index !== -1) {
        // 保存消息的匿名状态
        const isAnonymous = this.messages[chatId][index].isAnonymous || false;

        // 更新消息状态
        this.messages[chatId][index].pending = true;
        this.messages[chatId][index].failed = false;

        // 确保保留匿名状态
        this.messages[chatId][index].isAnonymous = isAnonymous;

        // 确保sender是一个对象
        if (typeof this.messages[chatId][index].sender === "string") {
          const userStore = useUserStore();
          this.messages[chatId][index].sender = {
            _id: userStore.userId || "",
            username: isAnonymous ? "匿名用户(我)" : userStore.username || "我",
            avatar: isAnonymous ? "" : userStore.avatar || "",
          };
        } else if (isAnonymous) {
          // 如果sender是对象且消息是匿名的，确保匿名设置正确
          this.messages[chatId][index].sender.username = "匿名用户(我)";
          this.messages[chatId][index].sender.avatar = "";
        }

        console.log(`重试消息: ${messageId}, 匿名状态: ${isAnonymous}`);
      }
    },

    // 清空指定用户的消息
    clearUserMessages(userId: string) {
      if (!userId) return;
      console.log(`清空用户 ${userId} 的消息`);

      // 创建新的记录，保持响应性
      const newMessages = { ...this.messages };

      // 删除指定用户的消息
      if (userId in newMessages) {
        delete newMessages[userId];
        this.messages = newMessages;
        console.log(`已清空用户 ${userId} 的消息`);
      }
    },
  },
});
