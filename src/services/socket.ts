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

    this.isConnecting.value = true;
    console.log("正在连接Socket.IO服务器...");

    try {
      // 创建Socket.IO连接
      this.socket = io(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
        {
          auth: {
            token,
          },
          transports: ["websocket", "polling"], // 优先使用WebSocket
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: 20000,
          forceNew: true,
        }
      );

      // 注册事件监听
      this.registerEventListeners();
    } catch (error) {
      console.error("Socket.IO连接初始化错误:", error);
      ElMessage.error("聊天服务连接失败，请刷新页面重试");
      this.isConnecting.value = false;
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
    this.socket.on("disconnect", () => {
      console.log("Socket.IO连接已断开");
      this.isConnected.value = false;

      if (this.chatStore) {
        this.chatStore.setConnectionState(false);
      }
    });

    // 连接错误
    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket.IO连接错误:", error.message);
      this.isConnected.value = false;
      this.isConnecting.value = false;

      ElMessage.error(`聊天服务连接错误: ${error.message}`);
    });

    // 接收消息
    this.socket.on("message:received", (data: { message: Message }) => {
      this.handleMessageReceived(data.message);
    });

    // 发送消息成功
    this.socket.on("message:sent", (data: { message: Message }) => {
      this.handleMessageSent(data.message);
    });

    // 消息已读
    this.socket.on(
      "message:read",
      (data: { messageId: string; readAt: string }) => {
        this.handleMessageRead(data);
      }
    );

    // 用户状态变化
    this.socket.on(
      "user:status",
      (data: { userId: string; status: "online" | "offline" }) => {
        this.handleUserStatus(data);
      }
    );

    // 用户正在输入
    this.socket.on(
      "user:typing",
      (data: { userId: string; isTyping: boolean }) => {
        this.handleUserTyping(data);
      }
    );

    // 错误消息
    this.socket.on("error", (data: { code: number; message: string }) => {
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
    contentType: "text" | "image" = "text",
    fileUrl: string | null = null,
    replyTo: string | null = null
  ) {
    if (!this.socket || !this.isConnected.value) {
      console.error("Socket.IO未连接，无法发送消息");
      ElMessage.error("网络连接已断开，请重新登录");
      return false;
    }

    try {
      const message: PrivateMessage = {
        recipient: recipientId,
        content,
        contentType,
        fileUrl,
        replyTo,
      };

      this.socket.emit("message:private", message);
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
      this.socket.emit("user:typing", { recipientId, isTyping });
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
  private handleMessageReceived(message: Message) {
    console.log("收到新消息:", message);

    if (!this.chatStore || !this.userStore) return;

    // 格式化消息对象以适配Pinia store
    const formattedMessage = {
      _id: message._id,
      senderId: message.sender._id,
      receiverId: message.recipient,
      content: message.content,
      createdAt: message.createdAt,
      read: message.readBy.length > 0,
      messageType: message.contentType,
      // 附加信息，用于显示
      sender: message.sender.username,
      avatar: message.sender.avatar,
      fileUrl: message.fileUrl,
      replyTo: message.replyTo,
      isDeleted: message.isDeleted,
      updatedAt: message.updatedAt,
    };

    // 添加到聊天记录
    this.chatStore.addMessage(formattedMessage);

    // 如果不是当前聊天，显示通知
    if (this.chatStore.currentChatId !== message.sender._id) {
      // 显示系统通知
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`来自 ${message.sender.username} 的新消息`, {
          body: message.content,
          icon: "/favicon.ico",
        });
      } else {
        // 回退到Element Plus消息通知
        ElMessage({
          message: `${message.sender.username}: ${message.content}`,
          type: "success",
          duration: 3000,
        });
      }
    }

    // 自动标记已读（如果是当前聊天）
    if (this.chatStore.currentChatId === message.sender._id) {
      this.markMessageAsRead(message._id);
    }
  }

  /**
   * 处理消息发送成功
   */
  private handleMessageSent(message: Message) {
    console.log("消息发送成功:", message);

    if (!this.chatStore) return;

    // 格式化消息对象
    const formattedMessage = {
      _id: message._id,
      senderId: message.sender._id,
      receiverId: message.recipient,
      content: message.content,
      createdAt: message.createdAt,
      read: message.readBy.length > 0,
      messageType: message.contentType,
      fileUrl: message.fileUrl,
      replyTo: message.replyTo,
      isDeleted: message.isDeleted,
      updatedAt: message.updatedAt,
    };

    // 更新消息状态
    this.chatStore.updateMessage(formattedMessage);
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
  private handleError(data: { code: number; message: string }) {
    console.error("Socket.IO错误:", data);

    // 显示错误消息
    ElMessage.error(data.message || "聊天服务发生错误");
  }

  /**
   * 获取好友头像
   */
  private getFriendAvatar(userId: string): string {
    if (!this.friendsStore) return "";

    const friend = this.friendsStore.getFriendById(userId);
    return friend?.avatar || "";
  }
}

// 创建单例实例
const socketService = new SocketService();

export default socketService;
