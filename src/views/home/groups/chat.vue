<template>
  <div
    class="group-chat-container bg-theme-main text-theme-normal"
    v-if="currentGroup"
  >
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="group-info">
        <el-avatar :size="36" :src="currentGroup.avatar" shape="square" />
        <div class="group-details">
          <div class="group-name">{{ currentGroup.name }}</div>
          <div class="group-stats">
            {{ currentGroup.members?.length || 0 }}人
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-tooltip content="群组信息">
          <el-button
            type="text"
            icon="el-icon-info"
            @click="showGroupInfo = true"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- 聊天内容区 -->
    <el-scrollbar ref="messagesScrollRef">
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="loading" class="loading-container">
          <el-spinner />
        </div>
        <template v-else>
          <div v-if="messages.length === 0" class="empty-messages">
            <div class="welcome-message">
              <div class="title">欢迎来到 {{ currentGroup.name }}</div>
              <div class="description">这是聊天的开始，来说点什么吧！</div>
            </div>
          </div>
          <div v-else class="message-list">
            <div
              v-for="(message, index) in filterDuplicateMessages(messages)"
              :key="message._id"
              :class="[
                'message-item',
                message.pending ? 'pending' : '',
                message.failed ? 'failed' : '',
              ]"
            >
              <!-- 显示日期分隔线 -->
              <div
                v-if="shouldShowDateDivider(message, index)"
                class="date-divider"
              >
                <span>{{ formatDate(message.createdAt) }}</span>
              </div>

              <div
                class="message-container"
                :class="{ 'self-container': message.isSelf }"
              >
                <!-- 显示发送者信息 -->
                <div
                  v-if="shouldShowSender(message, index) && !message.isSelf"
                  class="sender-info"
                >
                  <template v-if="message.isAnonymous">
                    <el-avatar
                      :size="36"
                      icon="el-icon-user"
                      class="anonymous-avatar"
                    />
                    <div class="sender-name anonymous-name">
                      {{ message.sender }}
                      <el-tooltip content="匿名消息" placement="top">
                        <el-tag size="small" effect="dark" class="anonymous-tag"
                          >匿名</el-tag
                        >
                      </el-tooltip>
                    </div>
                  </template>
                  <template v-else>
                    <el-avatar
                      :size="36"
                      :src="message.avatar || defaultAvatar"
                    />
                    <div class="sender-name">{{ message.sender }}</div>
                  </template>
                  <div class="message-time">
                    {{ formatTime(message.createdAt) }}
                  </div>
                </div>

                <div
                  class="message-content"
                  :class="{
                    'no-sender':
                      !shouldShowSender(message, index) && !message.isSelf,
                    'self-message': message.isSelf,
                    'anonymous-message': message.isAnonymous,
                    'message-theme-self': message.isSelf,
                    'message-theme-other': !message.isSelf,
                  }"
                >
                  <!-- 匿名标记，仅显示在自己发送的匿名消息上 -->
                  <div
                    v-if="message.isSelf && message.isAnonymous"
                    class="anonymous-indicator"
                  >
                    <el-tag size="small" effect="dark" class="anonymous-tag"
                      >匿名</el-tag
                    >
                  </div>

                  <div
                    v-if="message.messageType === 'text'"
                    class="text-content"
                  >
                    {{ message.content }}
                  </div>
                  <div
                    v-else-if="message.messageType === 'image'"
                    class="image-content"
                  >
                    <img
                      :src="message.fileUrl || ''"
                      @click="
                        message.fileUrl ? previewImage(message.fileUrl) : null
                      "
                    />
                  </div>
                  <div v-else class="file-content">
                    <a :href="message.fileUrl || ''" target="_blank">
                      <i class="el-icon-document"></i> 文件
                    </a>
                  </div>

                  <div v-if="message.pending" class="status-icon pending">
                    <i class="el-icon-loading"></i>
                  </div>
                  <div v-else-if="message.failed" class="status-icon failed">
                    <i class="el-icon-warning-outline"></i>
                  </div>

                  <div v-if="message.isSelf" class="self-message-time">
                    {{ formatTime(message.createdAt) }}
                  </div>
                </div>

                <!-- 失败消息的重试按钮 -->
                <div
                  v-if="message.failed"
                  class="retry-button"
                  :class="{ 'self-retry': message.isSelf }"
                >
                  <el-button size="mini" @click="retryMessage(message)"
                    >重试</el-button
                  >
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </el-scrollbar>

    <!-- 消息输入区 -->
    <div class="chat-input bg-theme-secondary">
      <div class="input-options">
        <el-switch
          v-model="isAnonymous"
          active-text="匿名聊天"
          inactive-text="实名聊天"
          class="anonymous-switch"
        />
        <el-tooltip
          content="匿名消息不会显示您的用户名和头像，但群组管理员可以查看发送者信息"
        >
          <el-icon class="info-icon"><question-filled /></el-icon>
        </el-tooltip>
      </div>
      <el-input
        v-model="inputMessage"
        type="textarea"
        :rows="3"
        placeholder="在这里输入消息..."
        resize="none"
        @keydown.enter.exact.prevent="sendMessage"
        class="input-theme"
      />
      <div class="input-actions">
        <el-tooltip content="发送图片">
          <el-button
            type="text"
            icon="el-icon-picture-outline"
            @click="triggerImageUpload"
          />
        </el-tooltip>
        <el-tooltip content="发送文件">
          <el-button
            type="text"
            icon="el-icon-document"
            @click="triggerFileUpload"
          />
        </el-tooltip>
        <el-button
          type="primary"
          @click="sendMessage"
          :disabled="!inputMessage.trim()"
          class="button-theme-primary"
        >
          发送
        </el-button>
      </div>
      <input
        ref="imageInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleImageUpload"
      />
      <input
        ref="fileInput"
        type="file"
        style="display: none"
        @change="handleFileUpload"
      />
    </div>

    <!-- 群组信息抽屉 -->
    <el-drawer
      title="群组信息"
      v-model="showGroupInfo"
      direction="rtl"
      size="350px"
      class="bg-theme-main text-theme-normal"
    >
      <div class="group-drawer-content">
        <div class="group-header">
          <el-avatar :size="80" :src="currentGroup.avatar" shape="square" />
          <h2>{{ currentGroup.name }}</h2>
          <p>{{ currentGroup.description }}</p>
        </div>
        <div class="group-section">
          <h3>基本信息</h3>
          <p><strong>创建者:</strong> {{ getCreatorName() }}</p>
          <p>
            <strong>创建时间:</strong>
            {{ formatFullDate(currentGroup.createdAt) }}
          </p>
          <p>
            <strong>成员数量:</strong> {{ currentGroup.members?.length || 0 }}
          </p>
        </div>
        <div class="group-section">
          <h3>成员列表</h3>
          <div class="member-list">
            <div
              v-for="member in currentGroup.members"
              :key="member.user._id"
              class="member-item"
            >
              <el-avatar :size="32" :src="member.user.avatar" />
              <span class="member-name">{{ member.user.username }}</span>
              <span class="member-role">{{
                getMemberRoleText(member.role)
              }}</span>
            </div>
          </div>
        </div>
        <!-- <div class="group-actions">
          <el-button type="danger" @click="leaveGroup">退出群组</el-button>
        </div> -->
      </div>
    </el-drawer>
  </div>
  <div v-else class="no-group-selected bg-theme-main">
    <div class="placeholder-content">
      <i class="el-icon-chat-dot-square"></i>
      <p>请选择一个群组开始聊天</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useGroupStore } from "@/stores/group";
import { useChatStore } from "@/stores/chat";
import { useUserStore } from "@/stores/user";
import { ElMessage, ElScrollbar } from "element-plus";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { zhCN } from "date-fns/locale/zh-CN";
import { QuestionFilled } from "@element-plus/icons-vue";

const route = useRoute();
const groupStore = useGroupStore();
const chatStore = useChatStore();
const userStore = useUserStore();

// 状态变量
const loading = ref(false);
const inputMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const messagesScrollRef = ref<InstanceType<typeof ElScrollbar>>();
const showGroupInfo = ref(false);
const imageInput = ref<HTMLInputElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const defaultAvatar = "/default-avatar.png";
const isAnonymous = ref(false);

// 获取路由参数中的群组ID
const groupId = computed(() => route.params.id as string);

// 监听路由变化，加载相应群组信息和消息
watch(
  groupId,
  async (newGroupId) => {
    if (newGroupId) {
      await loadGroupMessages(newGroupId);
    }
  },
  { immediate: true }
);

// 当前群组信息
const currentGroup = computed(() => groupStore.currentGroup);

// 获取聊天消息
const messages = computed(() => {
  if (!groupId.value) return [];
  return chatStore.getUserMessages(groupId.value);
});

// 监听消息变化，自动滚动到底部
watch(
  messages,
  (newMessages, oldMessages) => {
    if (
      newMessages.length > (oldMessages?.length || 0) ||
      newMessages.some((msg) => msg.isNewReceived)
    ) {
      nextTick(() => {
        scrollToBottom();
      });
    }
  },
  { deep: true }
);

// 加载群组消息
const loadGroupMessages = async (id: string) => {
  if (!id) return;

  loading.value = true;
  try {
    console.log("开始加载群组消息, 群组ID:", id);

    // 设置当前群组
    groupStore.setCurrentGroup(id);

    // 加载群组消息
    await groupStore.loadGroupMessages(id);

    // 输出消息数量
    console.log("群组消息加载完成，消息数量:", messages.value);

    // 滚动到最新消息
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("加载群组消息失败:", error);
    ElMessage.error("加载群组消息失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || !groupId.value) return;

  try {
    await groupStore.sendGroupMessage({
      groupId: groupId.value,
      content: inputMessage.value.trim(),
      contentType: "text",
      isAnonymous: isAnonymous.value,
    });

    // 清空输入框
    inputMessage.value = "";

    // 滚动到最新消息
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送消息失败，请重试");
  }
};

// 重试发送失败的消息
const retryMessage = async (message: any) => {
  if (!groupId.value) return;

  try {
    chatStore.retryMessage({
      chatId: groupId.value,
      messageId: message._id,
    });

    await groupStore.sendGroupMessage({
      groupId: groupId.value,
      content: message.content,
      contentType: message.messageType,
      fileUrl: message.fileUrl,
      isAnonymous: message.isAnonymous,
    });
  } catch (error) {
    console.error("重试发送消息失败:", error);
  }
};

// 触发图片上传
const triggerImageUpload = () => {
  if (imageInput.value) {
    imageInput.value.click();
  }
};

// 处理图片上传
const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  if (!file.type.startsWith("image/")) {
    ElMessage.error("请选择图片文件");
    return;
  }

  // TODO: 实现图片上传逻辑
  ElMessage.info("图片上传功能将在下个版本开放");
  input.value = "";
};

// 触发文件上传
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  // TODO: 实现文件上传逻辑
  ElMessage.info("文件上传功能将在下个版本开放");
  input.value = "";
};

// 预览图片
const previewImage = (url: string | null) => {
  if (!url) return;
  window.open(url, "_blank");
};

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesScrollRef.value) {
      // 使用ElScrollbar的滚动方法，设置为最大值让其滚动到底部
      console.log("正在滚动到底部...");
      messagesScrollRef.value.setScrollTop(9999999);

      // 再次尝试滚动，确保内容完全加载后的滚动
      setTimeout(() => {
        if (messagesScrollRef.value) {
          messagesScrollRef.value.setScrollTop(9999999);
        }
      }, 100);
    }
  }, 10);
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "今天";
  } else if (isYesterday(date)) {
    return "昨天";
  } else {
    return format(date, "yyyy年MM月dd日", { locale: zhCN });
  }
};

// 格式化时间
const formatTime = (dateStr: string) => {
  return format(new Date(dateStr), "HH:mm");
};

// 格式化完整日期
const formatFullDate = (dateStr: string) => {
  return format(new Date(dateStr), "yyyy年MM月dd日 HH:mm:ss", { locale: zhCN });
};

// 判断是否应该显示日期分隔线
const shouldShowDateDivider = (message: any, index: number) => {
  if (index === 0) return true;

  const currentDate = new Date(message.createdAt);
  const prevDate = new Date(messages.value[index - 1].createdAt);

  return !isSameDay(currentDate, prevDate);
};

// 判断是否应该显示发送者信息
const shouldShowSender = (message: any, index: number) => {
  if (index === 0) return true;

  const prevMessage = messages.value[index - 1];

  // 如果是新的一天，显示发送者
  if (shouldShowDateDivider(message, index)) return true;

  // 如果与上一条消息发送者不同，显示发送者
  if (prevMessage.senderId !== message.senderId) return true;

  // 如果与上一条消息间隔超过5分钟，显示发送者
  const currentTime = new Date(message.createdAt).getTime();
  const prevTime = new Date(prevMessage.createdAt).getTime();
  const fiveMinutes = 5 * 60 * 1000;

  return currentTime - prevTime > fiveMinutes;
};

// 获取创建者名称
const getCreatorName = () => {
  if (!currentGroup.value?.creator) return "未知";
  return currentGroup.value.creator.username;
};

// 获取成员角色文本
const getMemberRoleText = (role: string) => {
  switch (role) {
    case "admin":
      return "管理员";
    case "moderator":
      return "协管员";
    case "member":
      return "成员";
    default:
      return "成员";
  }
};

// 添加新的函数来过滤重复消息
const filterDuplicateMessages = (messages: any[]) => {
  const filteredMessages: any[] = [];
  const messageIds = new Set();
  const pendingMessages = new Map();

  // 先确认哪些消息是pending状态
  messages.forEach((msg) => {
    if (msg.pending) {
      // 用内容作为key，因为pending消息还没有确定的ID
      pendingMessages.set(msg.content, msg);
    }
  });

  // 过滤消息
  messages.forEach((msg) => {
    // 如果消息ID已添加过，则跳过
    if (messageIds.has(msg._id)) {
      return;
    }

    // 如果这个消息不是pending状态，但内容匹配一个pending消息
    // 且这两个消息是同一个人在同一时间段内发送的，则跳过pending消息
    if (!msg.pending && pendingMessages.has(msg.content)) {
      const pendingMsg = pendingMessages.get(msg.content);

      // 如果该消息内容已经有了非pending状态的消息，跳过pending消息
      if (pendingMsg.senderId === msg.senderId) {
        // 从待处理消息Map中移除这个消息，表示它已经有了非pending的对应消息
        pendingMessages.delete(msg.content);
      }
    }

    // 添加消息ID到已处理集合
    messageIds.add(msg._id);

    // 添加消息到结果数组
    filteredMessages.push(msg);
  });

  // 移除那些与非pending消息重复的pending消息
  return filteredMessages.filter((msg) => {
    if (msg.pending && !pendingMessages.has(msg.content)) {
      return false; // 这个pending消息已经有非pending版本了，丢弃
    }
    return true;
  });
};

// 组件挂载时初始化
onMounted(async () => {
  if (groupId.value) {
    await loadGroupMessages(groupId.value);

    // 加入群组聊天
    groupStore.joinGroup(groupId.value);
    console.log("加入群组:", groupId.value);
  }
});
</script>

<style lang="scss" scoped>
.group-chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 60px;
  padding: 16px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-main);

  .group-info {
    display: flex;
    align-items: center;

    .group-details {
      margin-left: 12px;

      .group-name {
        font-weight: 600;
        font-size: 16px;
        color: var(--color-text-normal);
      }

      .group-stats {
        font-size: 12px;
        color: var(--color-text-muted);
      }
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--color-bg-main);

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .empty-messages {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;

    .welcome-message {
      text-align: center;
      padding: 20px;

      .title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--color-text-normal);
      }

      .description {
        font-size: 14px;
        color: var(--color-text-muted);
      }
    }
  }

  .message-list {
    display: flex;
    flex-direction: column;
    width: 100%;

    .date-divider {
      text-align: center;
      margin: 16px 0;
      position: relative;

      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        height: 1px;
        background-color: var(--color-border);
        z-index: 1;
      }

      span {
        background-color: var(--color-bg-main);
        padding: 0 12px;
        position: relative;
        z-index: 2;
        color: var(--color-text-muted);
        font-size: 12px;
      }
    }

    .message-item {
      width: 100%;
      margin-bottom: 4px;
      display: flex;
      flex-direction: column;

      &.pending {
        opacity: 0.7;
      }

      &.failed {
        opacity: 0.7;

        .message-content {
          border: 1px solid #ed4245;
        }
      }

      .message-container {
        display: flex;
        flex-direction: column;
        max-width: 75%;

        &.self-container {
          align-items: flex-end;
          align-self: flex-end;
        }
      }

      .sender-info {
        display: flex;
        align-items: center;
        margin-top: 8px;
        margin-bottom: 4px;

        .sender-name {
          margin-left: 8px;
          font-weight: 500;
          color: var(--color-text-normal);
        }

        .message-time {
          margin-left: 8px;
          font-size: 11px;
          color: var(--color-text-muted);
        }
      }

      .message-content {
        padding: 8px 12px;
        border-radius: 4px;
        background-color: var(--color-message-other);
        color: var(--color-text-normal);
        word-break: break-word;
        position: relative;
        margin-bottom: 2px;

        &.self-message {
          background-color: var(--color-message-self);
          border-radius: 8px 0 8px 8px;
          color: white;
        }

        .text-content {
          white-space: pre-wrap;
          padding-right: 24px; // 为时间戳留出空间
        }

        .image-content {
          img {
            max-width: 280px;
            max-height: 280px;
            border-radius: 4px;
            cursor: pointer;
          }
        }

        .file-content {
          a {
            color: var(--color-text-link);
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .status-icon {
          position: absolute;
          right: -24px;
          bottom: 0;
          font-size: 14px;

          &.pending {
            color: #faa61a;
          }

          &.failed {
            color: #ed4245;
          }
        }

        .self-message-time {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.7);
          position: absolute;
          right: 8px;
          bottom: 4px;
        }

        &.anonymous-message {
          background-color: #363636;
        }

        .anonymous-indicator {
          margin-bottom: 4px;
          display: flex;
          justify-content: flex-end;

          .anonymous-tag {
            background-color: #606266;
            font-size: 10px;
            padding: 0 4px;
            height: 16px;
            line-height: 16px;
          }
        }
      }

      .retry-button {
        margin-top: 2px;
        margin-left: 44px;

        &.self-retry {
          align-self: flex-end;
          margin-left: 0;
          margin-right: 0;
        }
      }
    }
  }
}

.chat-input {
  padding: 16px;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);

  .input-options {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    .anonymous-switch {
      margin-right: 8px;
    }

    .info-icon {
      color: var(--color-text-muted);
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: var(--color-text-normal);
      }
    }
  }

  :deep(.el-textarea__inner) {
    background-color: var(--color-input-bg);
    border: none;
    color: var(--color-input-text);
    border-radius: 4px;

    &::placeholder {
      color: var(--color-text-muted);
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;

    .el-button--text {
      color: var(--color-text-muted);

      &:hover {
        color: var(--color-text-normal);
      }
    }
  }
}

.group-drawer-content {
  padding: 16px;

  .group-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
    text-align: center;

    h2 {
      margin: 16px 0 8px;
      font-size: 20px;
      color: var(--color-text-normal);
    }

    p {
      color: var(--color-text-muted);
      margin: 0;
    }
  }

  .group-section {
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
      color: var(--color-text-normal);
    }

    p {
      margin: 8px 0;
      color: var(--color-text-normal);
    }

    .member-list {
      max-height: 300px;
      overflow-y: auto;

      .member-item {
        display: flex;
        align-items: center;
        padding: 8px 0;

        .member-name {
          margin-left: 8px;
          flex: 1;
          color: var(--color-text-normal);
        }

        .member-role {
          font-size: 12px;
          color: var(--color-text-muted);
          background-color: var(--color-bg-tertiary);
          padding: 2px 6px;
          border-radius: 4px;
        }
      }
    }
  }

  .group-actions {
    margin-top: 32px;
    display: flex;
    justify-content: center;
  }
}

.no-group-selected {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-bg-main);

  .placeholder-content {
    text-align: center;
    color: var(--color-text-muted);

    i {
      font-size: 64px;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
    }
  }
}

.anonymous-avatar {
  background-color: #909399;
  color: #ffffff;
}

.anonymous-name {
  display: flex;
  align-items: center;

  .anonymous-tag {
    margin-left: 4px;
    background-color: #606266;
    font-size: 10px;
    padding: 0 4px;
    height: 16px;
    line-height: 16px;
  }
}
</style>
