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
  messageType: "text" | "image";
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
}

// 后端消息结构
export interface BackendMessage {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
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
    setCurrentChat(userId: string) {
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
      const chatId =
        message.senderId !== this.currentChatId
          ? message.senderId
          : message.receiverId;

      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }

      // 检查消息是否已存在
      const existingIndex = this.messages[chatId].findIndex(
        (msg) => msg._id === message._id
      );

      if (existingIndex === -1) {
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
      }
    },

    // 更新消息
    updateMessage(message: Message) {
      const chatId =
        message.senderId !== this.currentChatId
          ? message.senderId
          : message.receiverId;

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
      }
    },

    // 转换后端消息格式为前端格式
    convertMessageFormat(backendMessage: BackendMessage): Message {
      const userStore = useUserStore();
      const isCurrentUser = backendMessage.sender._id === userStore.userId;

      return {
        _id: backendMessage._id,
        senderId: backendMessage.sender._id,
        receiverId: backendMessage.recipient,
        content: backendMessage.content,
        createdAt: backendMessage.createdAt,
        read: backendMessage.readBy.length > 0,
        messageType: backendMessage.contentType,
        sender: backendMessage.sender.username,
        avatar: backendMessage.sender.avatar,
        fileUrl: backendMessage.fileUrl,
        replyTo: backendMessage.replyTo,
        isDeleted: backendMessage.isDeleted,
        updatedAt: backendMessage.updatedAt,
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

        if (response.data && response.data.success) {
          // 转换消息格式
          const messages = response.data.data.map((msg: BackendMessage) =>
            this.convertMessageFormat(msg)
          );

          // 设置消息
          this.messages[userId] = messages;

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
        this.messages[chatId][index].pending = true;
        this.messages[chatId][index].failed = false;
      }
    },
  },
});
