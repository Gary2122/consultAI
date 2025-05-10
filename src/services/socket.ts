import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";
import { useFriendsStore } from "@/stores/friends";
import { io, Socket } from "socket.io-client";

// 更新的接口定义
interface PrivateMessage {
  recipient: string;
  content: string;
  contentType?: "text" | "image";
  fileUrl?: string | null;
  replyTo?: string | null;
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

  /**
   * 初始化
   */
  init() {
    this.chatStore = useChatStore();
    this.userStore = useUserStore();
    this.friendsStore = useFriendsStore();
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
    this.socket.on("user-status", (data: any) => {
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
    contentType: "text",
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
        contentType: "text";
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

      console.log("发送消息:", messageData);

      // 发送消息
      this.socket.emit("message:private", messageData);
      return true;
    } catch (error) {
      console.error("发送消息失败:", error);
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
      this.socket.emit("message:read", { id: messageId });
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
        to: recipientId,
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

    if (!this.chatStore || !this.userStore) return;

    // 尝试适配不同的消息格式
    const messageData = {
      // 必须字段 - 使用适应性获取，兼容不同的数据结构
      _id: message._id || message.id,
      senderId: message.sender?._id || message.senderId || message.from,
      receiverId: message.recipient || message.receiverId || message.to,
      content: message.content || message.message || message.text || "",
      createdAt:
        message.createdAt || message.timestamp || new Date().toISOString(),

      // 可选字段
      read: Array.isArray(message.readBy)
        ? message.readBy.length > 0
        : !!message.read,
      messageType: message.contentType || message.type || "text",

      // 发送者信息
      sender: message.sender?.username || message.senderName || "用户",
      avatar: message.sender?.avatar || message.senderAvatar || "",

      // 其他可选字段
      fileUrl: message.fileUrl,
      replyTo: message.replyTo,
      isDeleted: message.isDeleted || false,
      updatedAt:
        message.updatedAt || message.createdAt || new Date().toISOString(),
    };

    console.log("格式化后的消息:", messageData);

    // 添加到聊天记录
    this.chatStore.addMessage(messageData);

    // 如果是当前聊天，标记为已读
    if (this.chatStore.currentChatId === messageData.senderId) {
      // 发送已读回执
      this.markMessageAsRead(messageData._id);
    } else {
      // 不是当前聊天，显示通知
      this.showNotification(messageData.sender, messageData.content);
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
    console.log("处理消息发送成功:", message);

    if (!this.chatStore) return;

    // 尝试适配不同的消息格式
    const messageData = {
      // 必须字段 - 使用适应性获取
      _id: message._id || message.id,
      senderId:
        message.sender?._id ||
        message.senderId ||
        message.from ||
        this.userStore?.userId,
      receiverId: message.recipient || message.receiverId || message.to,
      content: message.content || message.message || message.text || "",
      createdAt:
        message.createdAt || message.timestamp || new Date().toISOString(),

      // 可选字段
      read: Array.isArray(message.readBy)
        ? message.readBy.length > 0
        : !!message.read,
      messageType: message.contentType || message.type || "text",

      // 其他可选字段
      fileUrl: message.fileUrl,
      replyTo: message.replyTo,
      isDeleted: message.isDeleted || false,
      updatedAt:
        message.updatedAt || message.createdAt || new Date().toISOString(),

      // 设置为自己发送的消息
      isSelf: true,
    };

    console.log("格式化后的发送成功消息:", messageData);

    // 更新消息状态
    this.chatStore.updateMessage(messageData);
  }

  /**
   * 处理消息已读通知
   */
  private handleMessageRead(data: { messageId: string; readAt: string }) {
    console.log("消息已读:", data);

    if (!this.chatStore) return;

    // 更新消息已读状态
    this.chatStore.markMessageAsRead(data.messageId);
  }

  /**
   * 处理用户状态变化
   */
  private handleUserStatus(data: {
    userId: string;
    status: "online" | "offline";
  }) {
    console.log("用户状态变化:", data);

    if (!this.friendsStore) return;

    // 更新好友状态
    this.friendsStore.updateFriendStatus({
      userId: data.userId,
      status: data.status,
    });
  }

  /**
   * 处理用户正在输入通知
   */
  private handleUserTyping(data: { userId: string; isTyping: boolean }) {
    console.log("用户输入状态:", data);

    if (!this.chatStore) return;

    // 更新用户正在输入状态
    this.chatStore.setUserTyping({
      userId: data.userId,
      isTyping: data.isTyping,
    });
  }

  /**
   * 处理错误消息
   */
  private handleError(data: any) {
    console.error("Socket.IO错误:", data);

    // 尝试从不同的错误格式中提取错误消息
    let errorMessage = "聊天服务发生错误";

    if (typeof data === "string") {
      // 如果直接是字符串
      errorMessage = data;
    } else if (data) {
      // 尝试从对象中提取错误信息
      errorMessage =
        data.message ||
        data.error ||
        data.errorMessage ||
        (data.code ? `错误代码: ${data.code}` : errorMessage);
    }

    // 显示错误消息
    ElMessage.error(errorMessage);
  }

  /**
   * 获取好友头像
   */
  private getFriendAvatar(userId: string): string {
    if (!this.friendsStore) return "";

    const friend = this.friendsStore.getFriendById(userId);
    return friend?.avatar || "";
  }

  /**
   * 自动重连逻辑
   */
  private reconnect() {
    // 如果已达到最大重连次数，停止重连
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log(`已达到最大重连次数(${this.maxReconnectAttempts})，停止重连`);
      ElMessage.error("无法连接到聊天服务器，请刷新页面重试");
      return;
    }

    // 如果已经在连接中，不再发起新的连接
    if (this.isConnecting.value) {
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    // 获取token
    const userStore = useUserStore();
    if (userStore && userStore.token) {
      // 延迟重连
      setTimeout(() => {
        this.connect(userStore.token as string);
      }, 1000 * Math.min(this.reconnectAttempts, 5)); // 指数退避，最多等待5秒
    } else {
      console.error("无法重连：缺少用户令牌");
    }
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;
