<template>
  <div class="chat-container overflow-hidden h-full">
    <!-- 聊天顶部栏 -->
    <div
      class="chat-header flex items-center justify-between pl-16 pr-16 pb-12 pt-12"
    >
      <div class="chat-info flex items-center">
        <el-avatar
          :size="40"
          :src="currentChat?.avatar"
          :shape="isGroup ? 'square' : 'circle'"
        />
        <div>
          <div class="chat-name">{{ currentChat?.name }}</div>
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
      <div v-if="messages.length === 0" class="no-messages">
        <div class="empty-state">
          <i class="el-icon-chat-dot-round"></i>
          <p>没有消息，发送第一条消息开始聊天吧！</p>
        </div>
      </div>

      <template v-else>
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-item"
          :class="{ self: message.isSelf }"
        >
          <el-avatar v-if="!message.isSelf" :size="40" :src="message.avatar" />
          <div class="message-content">
            <div class="message-header">
              <span class="message-name" v-if="!message.isSelf">{{
                message.sender
              }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
          <el-avatar v-if="message.isSelf" :size="40" :src="message.avatar" />
        </div>
      </template>
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
          @keydown.enter.prevent="sendMessage"
        />
      </div>
      <div class="send-actions">
        <el-tooltip content="表情" placement="top">
          <i class="el-icon-magic-stick"></i>
        </el-tooltip>
        <el-tooltip content="发送" placement="top">
          <i class="el-icon-s-promotion" @click="sendMessage"></i>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";

// 定义类型
interface Friend {
  id: number;
  name: string;
  status: string;
  avatar: string;
  online: boolean;
}

interface Group {
  id: number;
  name: string;
  memberCount: number;
  avatar: string;
}

type ChatEntity = Friend | Group;

const route = useRoute();
const messagesRef = ref<HTMLElement | null>(null);
const messageText = ref("");

// 获取URL参数
const type = computed(() => route.query.type as string);
const id = computed(() => Number(route.query.id));
const isGroup = computed(() => type.value === "group");

// 模拟好友数据
const friends: Friend[] = [
  {
    id: 1,
    name: "Alice Cooper",
    status: "在线",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: true,
  },
  {
    id: 2,
    name: "Bob Johnson",
    status: "请勿打扰",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: true,
  },
  {
    id: 3,
    name: "Carol Smith",
    status: "离开",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: true,
  },
  {
    id: 4,
    name: "David Black",
    status: "离线",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: false,
  },
  {
    id: 5,
    name: "Eve White",
    status: "离线",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: false,
  },
];

// 模拟群组数据
const groups: Group[] = [
  {
    id: 101,
    name: "心理健康交流群",
    memberCount: 128,
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
  {
    id: 102,
    name: "情绪管理学习小组",
    memberCount: 36,
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
  {
    id: 103,
    name: "职场减压互助会",
    memberCount: 67,
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
];

// 根据ID获取当前聊天对象
const currentChat = computed<ChatEntity | undefined>(() => {
  if (isGroup.value) {
    return groups.find((g) => g.id === id.value);
  } else {
    return friends.find((f) => f.id === id.value);
  }
});

// 聊天状态显示
const chatStatus = computed(() => {
  if (!currentChat.value) return "";
  return isGroup.value
    ? `${(currentChat.value as Group).memberCount}人`
    : (currentChat.value as Friend).status;
});

// 模拟聊天消息数据
const messages = ref([
  {
    id: 1,
    sender: "Alice Cooper",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    content: "你好，最近怎么样？",
    time: "14:20",
    isSelf: false,
  },
  {
    id: 2,
    sender: "我",
    avatar:
      "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png",
    content: "挺好的，谢谢关心！最近有点焦虑，想找人聊聊。",
    time: "14:22",
    isSelf: true,
  },
  {
    id: 3,
    sender: "Alice Cooper",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    content: "没问题，我很乐意倾听。你想聊些什么呢？",
    time: "14:25",
    isSelf: false,
  },
]);

// 发送消息
const sendMessage = () => {
  if (!messageText.value.trim()) return;

  messages.value.push({
    id: Date.now(),
    sender: "我",
    avatar:
      "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png",
    content: messageText.value,
    time: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isSelf: true,
  });

  messageText.value = "";

  // 模拟对方回复
  setTimeout(() => {
    if (currentChat.value) {
      messages.value.push({
        id: Date.now(),
        sender: currentChat.value.name,
        avatar: currentChat.value.avatar,
        content: "收到你的消息，稍后回复！",
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSelf: false,
      });
      scrollToBottom();
    }
  }, 1000);

  scrollToBottom();
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

// 监听当前聊天对象变化
watch([id, type], () => {
  // 这里可以加载对应的聊天记录
  scrollToBottom();
});

onMounted(() => {
  scrollToBottom();
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

    .no-messages {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-state {
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
        }

        .message-text {
          padding: 10px 16px;
          background-color: #40444b;
          color: #dcddde;
          border-radius: 0 16px 16px 16px;
          word-break: break-word;
        }
      }
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
      }
    }
  }
}
</style>
