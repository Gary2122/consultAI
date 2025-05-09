<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-14 19:34:51
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-09 17:00:01
-->
<template>
  <div class="chat-container overflow-hidden h-full">
    <!-- 聊天顶部栏 -->
    <div
      class="chat-header flex items-center justify-between pl-16 pr-16 pb-12 pt-12"
    >
      <div class="chat-info flex items-center">
        <el-avatar
          :size="40"
          :src="currentFriend?.avatar"
          :shape="isGroup ? 'square' : 'circle'"
        />
        <div>
          <div class="chat-name">
            {{ currentFriend?.username || "未选择聊天" }}
          </div>
          <div class="chat-status">
            {{ chatStatus }}
          </div>
        </div>
      </div>
      <div class="chat-actions">
        <el-tooltip content="语音通话" placement="bottom">
          <i class="iconfont icon-zizhanghao"></i>
        </el-tooltip>
        <el-tooltip content="视频通话" placement="bottom">
          <i class="iconfont icon-zizhanghao"></i>
        </el-tooltip>
        <el-tooltip content="搜索" placement="bottom">
          <i class="iconfont icon-zizhanghao"></i>
        </el-tooltip>
        <el-tooltip content="更多" placement="bottom">
          <i class="iconfont icon-zizhanghao"></i>
        </el-tooltip>
      </div>
    </div>

    <!-- 聊天消息区 -->
    <div class="chat-messages" ref="messagesRef">
      <div v-if="isLoading" class="loading-state">
        <el-icon class="is-loading"><loading /></el-icon>
        <p>加载聊天历史中...</p>
      </div>
      <div v-else-if="messages.length === 0" class="no-messages">
        <div class="empty-state">
          <i class="el-icon-chat-dot-round"></i>
          <p>没有消息，发送第一条消息开始聊天吧！</p>
        </div>
      </div>
      <template v-else>
        <div
          v-for="(message, index) in displayMessages"
          :key="index"
          class="message-item"
          :class="{
            self: isSelfMessage(message),
            pending: message.pending,
            failed: message.failed,
          }"
        >
          <el-avatar
            v-if="!isSelfMessage(message)"
            :size="40"
            :src="getMessageAvatar(message)"
          />
          <div class="message-content">
            <div class="message-header">
              <span class="message-name" v-if="!isSelfMessage(message)">
                {{ getMessageSenderName(message) }}
              </span>
              <span class="message-time">
                {{ formatMessageTime(message.createdAt) }}
              </span>
              <span v-if="message.failed" class="message-failed-indicator">
                <i class="el-icon-warning-outline"></i>
                <el-button
                  type="text"
                  size="mini"
                  @click="retryMessage(message)"
                  >重试</el-button
                >
              </span>
            </div>
            <div class="message-text">{{ message.content }}</div>

            <!-- 文件显示 -->
            <div
              v-if="message.fileUrl && message.messageType === 'image'"
              class="message-image"
            >
              <el-image :src="message.fileUrl" fit="cover" />
            </div>
          </div>
          <el-avatar
            v-if="isSelfMessage(message)"
            :size="40"
            :src="userStore.avatar"
          />
        </div>
      </template>

      <!-- 用户正在输入提示 -->
      <div v-if="isUserTyping" class="typing-indicator">
        <span>{{ typingUserName }} 正在输入...</span>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="chat-input-area">
      <div class="attachment-actions">
        <el-tooltip content="添加附件" placement="top">
          <i class="el-icon-plus"></i>
        </el-tooltip>
      </div>
      <div class="message-input">
        <el-input
          v-model="messageText"
          type="textarea"
          :rows="1"
          placeholder="发送消息..."
          resize="none"
          :disabled="!currentFriend"
          @keydown.enter.prevent="sendMessage"
          @input="handleTyping"
        />
      </div>
      <div class="send-actions">
        <el-tooltip content="表情" placement="top">
          <i class="el-icon-magic-stick"></i>
        </el-tooltip>
        <el-tooltip content="发送" placement="top">
          <i
            class="el-icon-s-promotion"
            :class="{ disabled: !currentFriend }"
            @click="sendMessage"
          ></i>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";
import { useRoute } from "vue-router";
import { useChatStore } from "@/stores/chat";
import { useFriendsStore } from "@/stores/friends";
import { useUserStore } from "@/stores/user";
import socketService from "@/services/socket";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

// 定义消息类型接口 - 匹配更新后的store类型
interface ChatMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  messageType: "text" | "image";
  // 用于显示的额外信息
  sender?: string;
  avatar?: string;
  // 新增字段
  fileUrl?: string | null;
  replyTo?: string | null;
  isDeleted?: boolean;
  updatedAt?: string;
  // 用于客户端状态
  pending?: boolean;
  failed?: boolean;
  isSelf?: boolean;
}

// 获取状态管理
const chatStore = useChatStore();
const friendsStore = useFriendsStore();
const userStore = useUserStore();

// 获取DOM引用
const messagesRef = ref<HTMLElement | null>(null);
const messageText = ref("");
const isTyping = ref(false);
const typingTimeout = ref<number | null>(null);
const isLoading = ref(false);

// 路由
const route = useRoute();

// 获取URL参数
const type = computed(() => route.query.type as string);
const id = computed(() => route.query.id as string);
const isGroup = computed(() => type.value === "group");

// 当前选择的好友
const currentFriend = computed(() => {
  if (isGroup.value) {
    // 群组逻辑
    return null;
  } else if (id.value) {
    // 获取好友信息
    return friendsStore.getFriendById(id.value);
  }
  return null;
});

// 聊天状态显示
const chatStatus = computed(() => {
  if (!currentFriend.value) return "";

  if (isGroup.value) {
    // 群组状态逻辑
    return `成员数...`;
  } else {
    return currentFriend.value.status === "online" ? "在线" : "离线";
  }
});

// 获取当前聊天消息
const messages = computed(() => {
  return id.value ? chatStore.getUserMessages(id.value) : [];
});

// 处理实际显示消息
const displayMessages = computed(() => {
  return messages.value.map((msg) => {
    // 保持原始消息，添加displayTime等
    return msg;
  });
});

// 获取消息发送者头像
const getMessageAvatar = (message: ChatMessage): string => {
  if (message.avatar) return message.avatar;
  return getFriendAvatar(message.senderId);
};

// 获取消息发送者名称
const getMessageSenderName = (message: ChatMessage): string => {
  if (message.sender) return message.sender;
  return getFriendName(message.senderId);
};

// 检查消息是否是自己发送的
const isSelfMessage = (message: ChatMessage) => {
  console.log("message.senderId", message.senderId, userStore.userId);
  return message.isSelf || message.senderId === userStore.userId;
};

// 检查对方是否正在输入
const isUserTyping = computed(() => {
  return id.value ? chatStore.isUserTyping(id.value) : false;
});

// 获取正在输入的用户名
const typingUserName = computed(() => {
  if (!isUserTyping.value || !currentFriend.value) return "";
  return currentFriend.value.username || "对方";
});

// 获取好友头像
const getFriendAvatar = (friendId: string) => {
  const friend = friendsStore.getFriendById(friendId);
  return (
    friend?.avatar ||
    "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
  );
};

// 获取好友名称
const getFriendName = (friendId: string) => {
  const friend = friendsStore.getFriendById(friendId);
  return friend?.username || "好友";
};

// 格式化消息时间
const formatMessageTime = (time: string) => {
  if (!time) return "";

  try {
    const messageDate = new Date(time);
    return messageDate.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return time;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim() || !currentFriend.value) return;

  try {
    // 使用Pinia状态管理发送消息
    const tempId = await chatStore.sendMessage({
      receiverId: id.value,
      content: messageText.value.trim(),
      messageType: "text",
    });

    // 使用WebSocket实际发送消息
    const success = socketService.sendPrivateMessage(
      id.value,
      messageText.value.trim(),
      "text"
    );

    if (!success) {
      // 消息发送失败
      chatStore.messageFailure({
        chatId: id.value,
        messageId: tempId,
      });

      ElMessage.error("消息发送失败，请检查网络连接");
    }

    // 清空消息框
    messageText.value = "";

    // 清除正在输入状态
    clearTypingStatus();
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败");
  }

  scrollToBottom();
};

// 重试发送失败的消息
const retryMessage = (message: ChatMessage) => {
  if (message._id) {
    chatStore.retryMessage({
      chatId: id.value,
      messageId: message._id,
    });

    // 使用WebSocket重新发送消息
    socketService.sendPrivateMessage(
      id.value,
      message.content,
      message.messageType as "text" | "image"
    );
  }
};

// 处理用户输入状态
const handleTyping = () => {
  if (!isTyping.value && currentFriend.value) {
    isTyping.value = true;
    socketService.sendTypingStatus(id.value, true);
  }

  // 清除之前的超时
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  // 设置新的超时
  typingTimeout.value = window.setTimeout(() => {
    clearTypingStatus();
  }, 3000);
};

// 清除正在输入状态
const clearTypingStatus = () => {
  if (isTyping.value && currentFriend.value) {
    isTyping.value = false;
    socketService.sendTypingStatus(id.value, false);
  }

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

// 加载聊天记录
const loadChatHistory = async () => {
  if (!id.value) return;

  isLoading.value = true;

  try {
    await chatStore.loadChatHistory(id.value);
    console.log("id.value", id.value);
    scrollToBottom();
  } catch (error) {
    console.error("加载聊天记录失败:", error);
    ElMessage.error("加载聊天记录失败，请重试");
  } finally {
    isLoading.value = false;
  }
};

// 初始化好友列表
const initFriendsList = async () => {
  if (friendsStore.friends.length === 0) {
    try {
      await friendsStore.loadFriends();

      // 检查是否有待处理的好友请求
      const requests = await friendsStore.loadPendingRequests();

      if (requests.length > 0) {
        ElMessage({
          message: `您有 ${requests.length} 个待处理的好友请求`,
          type: "info",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("加载好友列表失败:", error);
    }
  }
};

// 初始化WebSocket连接
const initSocketConnection = () => {
  if (!socketService.isConnected.value && userStore.token) {
    socketService.init();
    socketService.connect(userStore.token);

    // 请求通知权限
    requestNotificationPermission();
  }
};

// 请求通知权限
const requestNotificationPermission = () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
};

// 监听聊天ID变化
watch([id, type], async (newValues, oldValues) => {
  if (newValues[0] !== oldValues[0]) {
    // 切换聊天对象
    if (newValues[0]) {
      // 加载对应的聊天记录
      chatStore.setCurrentChat(newValues[0]);
      await loadChatHistory();
    } else {
      // 清除当前聊天
      chatStore.setCurrentChat("");
    }
  }
});

// 监听新消息
watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  }
);

// 页面挂载完成
onMounted(async () => {
  // 初始化WebSocket连接
  initSocketConnection();

  // 加载好友列表
  await initFriendsList();

  // 如果URL有指定聊天ID，加载聊天记录
  if (id.value) {
    chatStore.setCurrentChat(id.value);
    await loadChatHistory();
  }
});

// 组件卸载前的清理
onBeforeUnmount(() => {
  clearTypingStatus();
});
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  // height: 100%;
  // overflow: hidden;

  .chat-header {
    // display: flex;
    // align-items: center;
    justify-content: space-between;
    // padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .chat-info {
      display: flex;
      align-items: center;

      .chat-name {
        margin-left: 12px;
        font-weight: 600;
        font-size: 16px;
        color: white;
      }

      .chat-status {
        margin-left: 12px;
        font-size: 12px;
        color: #b9bbbe;
      }
    }

    .chat-actions {
      display: flex;
      gap: 16px;

      i {
        font-size: 20px;
        color: #b9bbbe;
        cursor: pointer;

        &:hover {
          color: white;
        }
      }
    }
  }

  .chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background-color: #36393f;

    .loading-state,
    .no-messages {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .el-icon {
        font-size: 24px;
        color: #72767d;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: #72767d;
      }
    }

    .no-messages .empty-state {
      text-align: center;
      color: #72767d;

      i {
        font-size: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
      }
    }

    .message-item {
      display: flex;
      margin-bottom: 16px;

      &.self {
        flex-direction: row-reverse;

        .message-content {
          margin-right: 12px;
          margin-left: 0;

          .message-header {
            justify-content: flex-end;
          }

          .message-text {
            background-color: #5865f2;
            color: white;
            border-radius: 16px 0 16px 16px;
          }
        }
      }

      &.pending .message-text {
        opacity: 0.7;
      }

      &.failed .message-text {
        border: 1px solid #f56c6c;
      }

      .message-content {
        margin-left: 12px;
        max-width: 65%;

        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 4px;

          .message-name {
            font-weight: 500;
            font-size: 14px;
            color: white;
            margin-right: 8px;
          }

          .message-time {
            font-size: 12px;
            color: #72767d;
          }

          .message-failed-indicator {
            margin-left: 8px;
            color: #f56c6c;
            display: flex;
            align-items: center;

            i {
              margin-right: 4px;
            }
          }
        }

        .message-text {
          padding: 10px 16px;
          background-color: #40444b;
          color: #dcddde;
          border-radius: 0 16px 16px 16px;
          word-break: break-word;
        }

        .message-image {
          margin-top: 8px;
          max-width: 300px;

          .el-image {
            border-radius: 8px;
            overflow: hidden;
          }
        }
      }
    }

    .typing-indicator {
      padding: 8px 16px;
      color: #72767d;
      font-size: 12px;
      font-style: italic;
    }
  }

  .chat-input-area {
    display: flex;
    padding: 12px 16px;
    background-color: #40444b;

    .attachment-actions,
    .send-actions {
      display: flex;
      align-items: center;
      color: #b9bbbe;

      i {
        font-size: 24px;
        padding: 8px;
        cursor: pointer;

        &:hover {
          color: white;
        }

        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;

          &:hover {
            color: #b9bbbe;
          }
        }
      }
    }

    .message-input {
      flex: 1;
      margin: 0 12px;

      :deep(.el-textarea__inner) {
        background-color: #40444b;
        border: none;
        color: #dcddde;
        resize: none;

        &:focus {
          box-shadow: none;
        }

        &::placeholder {
          color: #72767d;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>
