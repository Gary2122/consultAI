import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";
import { useFriendsStore } from "@/stores/friends";
import { useGroupStore } from "@/stores/group";
import { io, Socket } from "socket.io-client";

// 更新的接口定义
interface PrivateMessage {
  recipient: string;
  content: string;
  contentType?: "text" | "image";
  fileUrl?: string | null;
  replyTo?: string | null;
}

// 群组消息接口
interface GroupMessage {
  groupId: string;
  content: string;
  contentType?: "text" | "image" | "file";
  fileUrl?: string | null;
  replyTo?: string | null;
  isAnonymous?: boolean;
}

// 更新消息结构匹配后端接口
interface Message {
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

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // 连接状态
  public isConnected = ref(false);
  public isConnecting = ref(false);

  // Pinia stores
  private chatStore: ReturnType<typeof useChatStore> | null = null;
  private userStore: ReturnType<typeof useUserStore> | null = null;
  private friendsStore: ReturnType<typeof useFriendsStore> | null = null;
  private groupStore: ReturnType<typeof useGroupStore> | null = null;

  /**
   * 初始化
   */
  init() {
    this.chatStore = useChatStore();
    this.userStore = useUserStore();
    this.friendsStore = useFriendsStore();
    this.groupStore = useGroupStore();
  }

  /**
   * 连接Socket.IO
   */
  connect(token: string) {
    if (this.socket && this.isConnected.value) {
      console.log("Socket.IO已连接");
      return;
    }

    // 如果已经在连接中，直接返回
    if (this.isConnecting.value) {
      console.log("Socket.IO正在连接中...");
      return;
    }

    this.isConnecting.value = true;
    console.log("正在连接Socket.IO服务器...");

    try {
      // 如果已有socket实例但断开了，先清理
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      // 创建Socket.IO连接 - 与chat-test.html保持一致的配置
      this.socket = io(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
        {
          auth: {
            token,
          },
          transports: ["websocket", "polling"], // 优先使用WebSocket
          reconnectionAttempts: 5, // 最多重连5次
          reconnectionDelay: 1000, // 重连延迟1秒
          timeout: 20000, // 连接超时时间
          forceNew: true, // 强制创建新连接
        }
      );

      // 注册事件监听
      this.registerEventListeners();
    } catch (error) {
      console.error("Socket.IO连接初始化错误:", error);
      ElMessage.error("聊天服务连接失败，请刷新页面重试");
      this.isConnecting.value = false;
      this.isConnected.value = false;
    }
  }

  /**
   * 注册Socket.IO事件监听
   */
  private registerEventListeners() {
    if (!this.socket) return;

    // 连接成功
    this.socket.on("connect", () => {
      console.log("Socket.IO连接成功");
      this.isConnected.value = true;
      this.isConnecting.value = false;
      this.reconnectAttempts = 0;

      if (this.chatStore) {
        this.chatStore.setConnectionState(true);
      }
    });

    // 连接断开
    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO连接已断开，原因:", reason);
      this.isConnected.value = false;

      if (this.chatStore) {
        this.chatStore.setConnectionState(false);
      }

      // 如果不是主动关闭，可以考虑自动重连
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "ping timeout"
      ) {
        console.log("尝试重新连接...");
        // 服务器断开连接，需要手动重连
        this.reconnect();
      }
    });

    // 连接错误
    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket.IO连接错误:", error.message);
      this.isConnected.value = false;
      this.isConnecting.value = false;

      ElMessage.error(`聊天服务连接错误: ${error.message}`);

      // 连接错误时自动尝试重连
      this.reconnect();
    });

    // 接收消息 - 修改为服务器实际发送的事件名
    this.socket.on("message:received", (data: any) => {
      console.log("收到新消息数据:", data);
      // 检查数据结构，适配到我们的消息格式
      if (data && data.message) {
        this.handleMessageReceived(data.message);
      } else if (data) {
        // 如果数据结构不同，尝试适配
        this.handleMessageReceived(data);
      }
    });

    // 消息发送成功回执 - 修改为服务器实际发送的事件名
    this.socket.on("message:sent", (data: any) => {
      console.log("消息发送成功响应:", data);
      if (data && data.message) {
        this.handleMessageSent(data.message);
      } else if (data) {
        this.handleMessageSent(data);
      }
    });

    // 消息已读 - 修改为服务器实际发送的事件名
    this.socket.on("message:read", (data: any) => {
      console.log("消息已读通知:", data);
      // 适配数据结构
      const readData = {
        messageId: data.id || data.messageId,
        readAt: data.readAt || new Date().toISOString(),
      };
      this.handleMessageRead(readData);
    });

    // 用户状态变化 - 修改为服务器实际发送的事件名
    this.socket.on("user:status", (data: any) => {
      console.log("用户状态变化:", data);
      // 适配数据结构
      const statusData = {
        userId: data.userId || data.id,
        status: data.status || "offline",
      };
      this.handleUserStatus(statusData);
    });

    // 用户正在输入 - 修改为服务器实际发送的事件名
    this.socket.on("user:typing", (data: any) => {
      console.log("用户输入状态:", data);
      // 适配数据结构
      const typingData = {
        userId: data.from || data.userId,
        isTyping: data.isTyping,
      };
      this.handleUserTyping(typingData);
    });

    // 群组成员加入
    this.socket.on("group:memberJoined", (data: any) => {
      console.log("群组成员加入:", data);
      if (this.groupStore) {
        this.groupStore.handleMemberJoined(data);
      }
    });

    // 群组成员离开
    this.socket.on("group:memberLeft", (data: any) => {
      console.log("群组成员离开:", data);
      if (this.groupStore) {
        this.groupStore.handleMemberLeft(data);
      }
    });

    // 错误消息
    this.socket.on("error", (data: any) => {
      console.error("Socket.IO错误:", data);
      this.handleError(data);
    });
  }

  /**
   * 断开Socket.IO连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.value = false;
    }
  }

  /**
   * 发送私聊消息
   */
  sendPrivateMessage(
    recipientId: string,
    content: string,
    contentType: "text" | "image" | "file" = "text",
    fileUrl: string | null = null,
    replyTo: string | null = null
  ) {
    if (!this.socket || !this.isConnected.value) {
      console.error("Socket.IO未连接，无法发送消息");
      ElMessage.error("网络连接已断开，请重新登录");
      return false;
    }

    try {
      // 修正消息格式，定义包含可选字段的接口
      interface PrivateMessageData {
        recipientId: string;
        content: string;
        contentType: "text" | "image" | "file";
        fileUrl?: string | null;
        replyTo?: string | null;
      }

      // 创建基本消息对象
      const messageData: PrivateMessageData = {
        recipientId,
        content,
        contentType,
      };

      // 只在有值的情况下添加可选字段
      if (fileUrl) {
        messageData.fileUrl = fileUrl;
      }

      if (replyTo) {
        messageData.replyTo = replyTo;
      }

      console.log("发送私聊消息:", messageData);

      // 发送消息
      this.socket.emit("message:private", messageData);
      return true;
    } catch (error) {
      console.error("发送消息失败:", error);
      return false;
    }
  }

  /**
   * 发送群组消息
   */
  sendGroupMessage(
    groupId: string,
    content: string,
    contentType: "text" | "image" | "file" = "text",
    fileUrl: string | null = null,
    replyTo: string | null = null,
    isAnonymous: boolean = false
  ) {
    if (!this.socket || !this.isConnected.value) {
      console.error("Socket.IO未连接，无法发送群组消息");
      ElMessage.error("网络连接已断开，请重新登录");
      return false;
    }

    try {
      // 创建群组消息对象
      const messageData: GroupMessage = {
        groupId,
        content,
        contentType,
        isAnonymous,
      };

      // 只在有值的情况下添加可选字段
      if (fileUrl) {
        messageData.fileUrl = fileUrl;
      }

      if (replyTo) {
        messageData.replyTo = replyTo;
      }

      console.log("发送群组消息:", messageData);

      // 发送消息
      this.socket.emit("message:group", messageData);
      return true;
    } catch (error) {
      console.error("发送群组消息失败:", error);
      return false;
    }
  }

  /**
   * 加入群组
   */
  joinGroup(groupId: string) {
    if (!this.socket || !this.isConnected.value) return false;

    try {
      this.socket.emit("group:join", { groupId });
      return true;
    } catch (error) {
      console.error("加入群组失败:", error);
      return false;
    }
  }

  /**
   * 离开群组
   */
  leaveGroup(groupId: string) {
    if (!this.socket || !this.isConnected.value) return false;

    try {
      this.socket.emit("group:leave", { groupId });
      return true;
    } catch (error) {
      console.error("离开群组失败:", error);
      return false;
    }
  }

  /**
   * 标记消息为已读
   */
  markMessageAsRead(messageId: string) {
    if (!this.socket || !this.isConnected.value) return false;

    try {
      // 修改为服务器期望的事件名和参数结构
      this.socket.emit("message:markAsRead", { messageId });
      return true;
    } catch (error) {
      console.error("标记消息已读失败:", error);
      return false;
    }
  }

  /**
   * 发送正在输入状态
   */
  sendTypingStatus(recipientId: string, isTyping: boolean) {
    if (!this.socket || !this.isConnected.value) return false;

    try {
      // 修改为服务器期望的事件名和参数结构
      this.socket.emit("user:typing", {
        recipientId,
        isTyping,
      });
      return true;
    } catch (error) {
      console.error("发送输入状态失败:", error);
      return false;
    }
  }

  // ============================
  // 事件处理方法
  // ============================

  /**
   * 处理接收到的新消息
   */
  private handleMessageReceived(message: any) {
    console.log("处理收到的新消息:", message);

    if (!this.chatStore || !this.userStore) {
      console.error("Chat store或User store未初始化，无法处理消息");
      return;
    }

    // 保存本地引用，避免空检查问题
    const chatStore = this.chatStore;
    const userStore = this.userStore;

    // 判断是否为群组消息
    const isGroupMessage = message.recipientModel === "groups";
    // 判断是否为匿名消息
    const isAnonymous = !!message.isAnonymous;

    // 尝试适配不同的消息格式
    const messageData = {
      // 必须字段 - 使用适应性获取，兼容不同的数据结构
      _id:
        message._id ||
        message.id ||
        `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: message.sender?._id || message.senderId || message.from,
      receiverId:
        message.recipient ||
        message.receiverId ||
        message.to ||
        userStore.userId,
      content: message.content || message.message || message.text || "",
      createdAt:
        message.createdAt || message.timestamp || new Date().toISOString(),

      // 可选字段
      read: Array.isArray(message.readBy)
        ? message.readBy.length > 0
        : !!message.read,
      messageType: message.contentType || message.type || "text",

      // 发送者信息 - 为匿名消息显示特殊名称
      sender: isAnonymous
        ? "匿名用户"
        : message.sender?.username || message.senderName || "用户",
      avatar: isAnonymous
        ? ""
        : message.sender?.avatar || message.senderAvatar || "",

      // 其他可选字段
      fileUrl: message.fileUrl,
      replyTo: message.replyTo,
      isDeleted: message.isDeleted || false,
      updatedAt:
        message.updatedAt || message.createdAt || new Date().toISOString(),

      // 群组消息标记
      isGroupMessage,
      // 匿名消息标记
      isAnonymous,

      // 特殊标记 - 确保在UI中能够识别这是一个新收到的消息
      isNewReceived: true,

      // 标记是否是自己发送的消息
      isSelf:
        message.sender?._id === userStore.userId ||
        message.senderId === userStore.userId,
    };

    console.log("格式化后的消息:", messageData);

    try {
      // 添加到聊天记录
      chatStore.addMessage(messageData);
      console.log(
        `已添加消息到聊天记录，ID: ${messageData._id}, 发送者: ${messageData.senderId}, 接收者: ${messageData.receiverId}, 群组消息: ${isGroupMessage}`
      );

      // 检查是否是当前聊天
      const isCurrentChat = isGroupMessage
        ? this.groupStore?.currentGroupId === messageData.receiverId
        : chatStore.currentChatId === messageData.senderId;

      if (isCurrentChat) {
        console.log("当前正在查看此聊天，应该更新UI");

        // 手动触发Vue更新，但不清空消息
        // 设置一个特殊标志，让组件知道需要强制刷新
        const updatedMessage = { ...messageData, forceRender: true };

        // 更新消息而不是添加，这样就不会有空数组的中间状态
        chatStore.updateMessage(updatedMessage);

        // 如果是当前聊天，标记为已读
        this.markMessageAsRead(messageData._id);
      } else {
        // 不是当前聊天，显示通知
        this.showNotification(messageData.sender, messageData.content);
      }
    } catch (error) {
      console.error("处理接收消息时出错:", error);
    }
  }

  /**
   * 显示通知
   */
  private showNotification(senderName: string, content: string) {
    // 显示系统通知
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`来自 ${senderName} 的新消息`, {
        body: content,
        icon: "/favicon.ico",
      });
    } else {
      // 回退到Element Plus消息通知
      ElMessage({
        message: `${senderName}: ${content}`,
        type: "success",
        duration: 3000,
      });
    }
  }

  /**
   * 处理消息发送成功
   */
  private handleMessageSent(message: any) {
    console.log("处理发送成功的消息:", message);

    if (!this.chatStore || !this.userStore) {
      console.error("Chat store或User store未初始化，无法处理消息");
      return;
    }

    // 保存本地引用
    const chatStore = this.chatStore;
    const userStore = this.userStore;

    // 判断是否为群组消息
    const isGroupMessage = message.recipientModel === "groups";
    // 判断是否为匿名消息
    const isAnonymous = !!message.isAnonymous;

    try {
      // 转换为本地消息格式
      const messageData = {
        _id: message._id || message.id,
        senderId: message.sender?._id || userStore.userId,
        receiverId: message.recipient,
        content: message.content || message.message || message.text || "",
        createdAt: message.createdAt || new Date().toISOString(),
        read: Array.isArray(message.readBy)
          ? message.readBy.length > 0
          : !!message.read,
        messageType: message.contentType || message.type || "text",
        // 根据匿名状态设置发送者信息
        sender: isAnonymous
          ? "匿名用户"
          : message.sender?.username || userStore.username || "我",
        avatar: isAnonymous
          ? ""
          : message.sender?.avatar || userStore.avatar || "",
        fileUrl: message.fileUrl,
        replyTo: message.replyTo,
        isDeleted: message.isDeleted || false,
        updatedAt:
          message.updatedAt || message.createdAt || new Date().toISOString(),
        isSelf: true, // 是当前用户发送的消息
        isGroupMessage, // 群组消息标记
        isAnonymous, // 匿名消息标记
      };

      console.log("发送成功，格式化后的消息:", messageData);

      // 确定聊天ID
      let chatId;
      if (isGroupMessage) {
        chatId = message.recipient; // 群组ID
      } else {
        chatId = message.recipient; // 私聊接收者ID
      }

      // 在添加新消息前，查找并更新/删除对应的pending消息
      if (chatStore.messages[chatId]) {
        // 查找内容相同的pending消息
        const pendingIndex = chatStore.messages[chatId].findIndex(
          (msg) =>
            msg.pending &&
            msg.content === messageData.content &&
            msg.senderId === messageData.senderId
        );

        if (pendingIndex !== -1) {
          // 找到对应的pending消息，用新消息替换它
          console.log(`替换原pending消息，索引: ${pendingIndex}`);

          // 确保匿名状态与原pending消息一致
          const pendingMsg = chatStore.messages[chatId][pendingIndex];
          if (pendingMsg.isAnonymous && !messageData.isAnonymous) {
            console.log("修正匿名状态: 后端未返回匿名标记，但原消息是匿名的");
            messageData.isAnonymous = true;
            messageData.sender = "匿名用户";
            messageData.avatar = "";
          }

          chatStore.messages[chatId].splice(pendingIndex, 1);
        }
      }

      // 添加确认的消息到聊天记录
      chatStore.addMessage(messageData);
    } catch (error) {
      console.error("处理发送成功消息时出错:", error);
    }
  }

  /**
   * 处理消息已读
   */
  private handleMessageRead(data: { messageId: string; readAt: string }) {
    console.log("处理消息已读:", data);

    if (!this.chatStore) {
      console.error("Chat store未初始化，无法处理消息已读");
      return;
    }

    try {
      // 更新消息为已读
      this.chatStore.markMessageAsRead(data.messageId);
    } catch (error) {
      console.error("处理消息已读时出错:", error);
    }
  }

  /**
   * 处理用户状态变化
   */
  private handleUserStatus(data: {
    userId: string;
    status: "online" | "offline";
  }) {
    console.log("处理用户状态变化:", data);

    if (!this.friendsStore) {
      console.error("Friends store未初始化，无法处理用户状态");
      return;
    }

    try {
      // 更新好友状态
      this.friendsStore.updateFriendStatus({
        userId: data.userId,
        status: data.status,
      });
    } catch (error) {
      console.error("处理用户状态变化时出错:", error);
    }
  }

  /**
   * 处理用户正在输入
   */
  private handleUserTyping(data: { userId: string; isTyping: boolean }) {
    console.log("处理用户输入状态:", data);

    if (!this.chatStore) {
      console.error("Chat store未初始化，无法处理用户输入状态");
      return;
    }

    try {
      // 更新用户输入状态
      this.chatStore.setUserTyping({
        userId: data.userId,
        isTyping: data.isTyping,
      });
    } catch (error) {
      console.error("处理用户输入状态时出错:", error);
    }
  }

  /**
   * 处理错误
   */
  private handleError(data: any) {
    console.error("Socket.IO错误:", data);

    const errorMessage = data.message || "未知错误";

    // 显示错误消息
    ElMessage({
      message: errorMessage,
      type: "error",
      duration: 5000,
    });

    // 根据错误类型进行不同处理
    if (
      errorMessage.includes("认证") ||
      errorMessage.includes("token") ||
      errorMessage.includes("auth")
    ) {
      // 认证错误，可能需要重新登录
      console.warn("Socket认证错误，可能需要重新登录");
      // TODO: 处理重新登录逻辑
    }
  }

  /**
   * 获取好友头像
   */
  private getFriendAvatar(userId: string): string {
    if (!this.friendsStore) return "";

    const friend = this.friendsStore.getFriendById(userId);
    return friend ? friend.avatar : "";
  }

  /**
   * 重新连接
   */
  private reconnect() {
    this.reconnectAttempts++;
    console.log(
      `尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      // 使用指数退避算法增加重连间隔
      const delay = Math.min(
        1000 * Math.pow(2, this.reconnectAttempts - 1),
        30000
      );

      setTimeout(() => {
        if (!this.isConnected.value) {
          const token = localStorage.getItem("token");
          if (token) {
            this.connect(token);
          } else {
            console.error("无可用token，无法重新连接");
            ElMessage.error("登录已过期，请重新登录");
          }
        }
      }, delay);
    } else {
      console.error("达到最大重连次数，停止重连");
      ElMessage.error("无法连接到聊天服务器，请刷新页面或重新登录");
    }
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;
