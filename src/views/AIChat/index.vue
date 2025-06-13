<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-28 14:25:41
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-06-13 13:57:47
-->
<template>
  <div class="ai-chat-container">
    <!-- 历史会话抽屉 -->
    <el-drawer
      v-model="showHistory"
      title="历史会话"
      direction="rtl"
      size="300px"
    >
      <div class="history-actions flex-cc pb-16">
        <el-button
          color="#626aef"
          @click="createNewSession"
          style="width: 150px; border: 1px solid #ffffff"
          dark="true"
          >新建对话</el-button
        >
        <el-button
          color="#f5f5f5"
          @click="createNewSession"
          style="
            flex: 1;
            background-color: #2e2e2e6c;
            border: 2px dashed #bdbdbd;
          "
          plain
          >匿名对话</el-button
        >
      </div>
      <div class="history-list">
        <div
          v-for="(session, index) in historySessions"
          :key="index"
          class="history-item"
          :class="{ active: currentSessionId === session.id }"
          @click="loadSession(session)"
        >
          <div class="session-title">{{ session.title }}</div>
          <div class="session-time">{{ session.time }}</div>
        </div>
      </div>
    </el-drawer>

    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="ai-info">
        <el-avatar
          :size="40"
          src="https://picx.zhimg.com/v2-7dd4cadc93d5648681d063e9d56e94ef_1440w.jpg"
        />
        <div>
          <div class="ai-name">心理AI助手</div>
          <div class="ai-status">
            <span class="status-dot online"></span>
            在线
          </div>
        </div>
      </div>
      <div class="header-actions flex-cc">
        <el-tooltip content="历史会话" placement="bottom">
          <el-button type="text" @click="showHistory = true"
            ><i class="iconfont icon-lishijilu !fs-24"></i>历史对话
          </el-button>
        </el-tooltip>
        <el-tooltip content="清空对话" placement="bottom">
          <el-button type="text" @click="clearConversation"
            ><i class="iconfont icon-ic_qingkong !fs-20"></i
          ></el-button>
        </el-tooltip>
        <el-tooltip content="设置" placement="bottom">
          <el-button type="text" @click="showSettings = true"
            ><i class="iconfont icon-xitongshezhi !fs-22"></i
          ></el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 聊天内容区 -->
    <div class="chat-content" ref="chatContentRef">
      <!-- 欢迎消息 -->
      <div class="welcome-message" v-if="messages.length === 0">
        <img
          src="https://picx.zhimg.com/v2-7dd4cadc93d5648681d063e9d56e94ef_1440w.jpg"
          alt="AI助手"
          class="welcome-img"
        />
        <h2>欢迎使用心理AI助手</h2>
        <p>我是你的AI心理顾问，随时准备帮助你解决情绪和心理问题。</p>
        <div class="suggestion-prompts">
          <div
            v-for="(prompt, index) in suggestionPrompts"
            :key="index"
            class="prompt-item"
            @click="sendPromptMessage(prompt)"
          >
            {{ prompt }}
          </div>
        </div>
      </div>

      <!-- 聊天消息 -->
      <template v-else>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="message-item"
          :class="{ 'user-message': msg.isUser }"
        >
          <div class="message-avatar">
            <el-avatar
              :size="36"
              :src="
                msg.isUser
                  ? userStore.avatar
                  : 'https://picx.zhimg.com/v2-7dd4cadc93d5648681d063e9d56e94ef_1440w.jpg'
              "
            />
          </div>
          <div class="message-content">
            <div class="message-sender">
              {{ msg.isUser ? "你" : "AI心理助手" }}
              <span class="message-time">{{ msg.time }}</span>
            </div>
            <div class="message-text" v-if="!msg.thinking">
              <div
                v-if="!msg.isUser"
                v-html="marked(msg.content)"
                class="markdown-content"
              ></div>
              <template v-else>{{ msg.content }}</template>
            </div>
            <div class="thinking-indicator" v-else>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <div class="input-wrapper">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="2"
          placeholder="输入你想要咨询的问题..."
          resize="none"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <div class="input-actions">
          <el-tooltip content="上传图片" placement="top">
            <el-button
              type="text"
              icon="el-icon-picture"
              :disabled="isProcessing"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="语音输入" placement="top">
            <el-button
              type="text"
              icon="el-icon-microphone"
              :disabled="isProcessing"
            ></el-button>
          </el-tooltip>
          <el-button
            type="primary"
            icon="el-icon-s-promotion"
            :disabled="!inputMessage.trim() || isProcessing"
            @click="sendMessage"
            class="send-button"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>

    <!-- 设置对话框 -->
    <el-dialog title="AI助手设置" v-model="showSettings" width="400px">
      <div class="settings-content">
        <div class="setting-item">
          <span>AI模型:</span>
          <el-select v-model="aiModel" placeholder="选择模型">
            <el-option label="GPT-3.5" value="gpt-3.5" />
            <el-option label="GPT-4" value="gpt-4" />
            <el-option label="心理专家模型" value="psychology-expert" />
          </el-select>
        </div>
        <div class="setting-item">
          <span>回复风格:</span>
          <el-select v-model="responseStyle" placeholder="选择风格">
            <el-option label="简洁" value="concise" />
            <el-option label="详细" value="detailed" />
            <el-option label="专业" value="professional" />
            <el-option label="友好" value="friendly" />
          </el-select>
        </div>
        <div class="setting-item">
          <span>记忆对话历史:</span>
          <el-switch v-model="rememberHistory" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="saveSettings">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { marked } from "marked";
import { useUserStore } from "@/stores/user";

// 消息类型定义
interface Message {
  content: string;
  isUser: boolean;
  time: string;
  thinking?: boolean;
}

// 会话类型定义
interface Session {
  id: string;
  title: string;
  time: string;
  messages: Message[];
}

// 响应式状态
const inputMessage = ref("");
const messages = ref<Message[]>([]);
const isProcessing = ref(false);
const chatContentRef = ref<HTMLElement | null>(null);
const showSettings = ref(false);
const showHistory = ref(false);
const historySessions = ref<Session[]>([]);
const currentSessionId = ref<string>("");
const isAnonymous = ref(false);
const userStore = useUserStore();

// AI设置
const aiModel = ref("psychology-expert");
const responseStyle = ref("friendly");
const rememberHistory = ref(true);

// 建议提示
const suggestionPrompts = [
  "我最近感到很焦虑，有什么放松的方法吗？",
  "如何改善我的睡眠质量？",
  "我该如何应对工作压力？",
  "如何处理人际关系中的冲突？",
];

// 处理匿名模式切换
const handleAnonymousChange = (value: boolean) => {
  if (value) {
    // 切换到匿名模式时，清除当前会话
    clearConversation();
  } else {
    // 切换到正常模式时，创建新会话
    createNewSession();
  }
};

// 创建新会话
const createNewSession = async () => {
  if (isAnonymous.value) {
    // 匿名模式下不创建会话记录
    currentSessionId.value = "";
    messages.value = [];
    return "";
  }
  if (messages.value.length === 0) {
    ElMessage.success("目前已经是最新对话了~");
    return;
  }

  try {
    // 创建新会话
    const response = await fetch("http://localhost:3000/api/ai-chat/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify({
        title: "新会话",
        messages: [],
        tags: [],
      }),
    });

    if (response.ok) {
      const result = await response.json();
      const newSession: Session = {
        id: result.id,
        title: "新会话",
        time: new Date().toLocaleString("zh-CN"),
        messages: [],
      };
      historySessions.value.unshift(newSession);
      currentSessionId.value = result.id;
      messages.value = [];
      return result.id;
    }
  } catch (error) {
    console.error("Failed to create new session:", error);
    ElMessage.error("创建新会话失败");
  }
  return "";
};

// 加载会话
const loadSession = async (session: Session) => {
  currentSessionId.value = session.id;
  messages.value = session.messages;
  showHistory.value = false;
  await scrollToBottom();
};

// 保存会话
const saveSession = async () => {
  // 匿名模式下不保存会话
  if (isAnonymous.value) {
    return;
  }

  if (!currentSessionId.value) {
    createNewSession();
  }

  const session = historySessions.value.find(
    (s) => s.id === currentSessionId.value
  );
  if (session) {
    session.messages = messages.value;
    session.time = new Date().toLocaleString("zh-CN");

    // 更新会话标题（使用第一条用户消息作为标题）
    const firstUserMessage = messages.value.find((msg) => msg.isUser);
    if (firstUserMessage) {
      session.title =
        firstUserMessage.content.slice(0, 20) +
        (firstUserMessage.content.length > 20 ? "..." : "");
    }

    // 保存到后端
    try {
      await fetch("http://localhost:3000/api/ai-chat/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(session),
      });
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  }
};

// 发送消息到AI
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isProcessing.value) return;

  // 如果没有当前会话，创建新会话
  if (!currentSessionId.value) {
    createNewSession();
  }

  // 添加用户消息
  const userMessage: Message = {
    content: inputMessage.value,
    isUser: true,
    time: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  messages.value.push(userMessage);

  // 清空输入
  inputMessage.value = "";

  // 显示AI思考中
  isProcessing.value = true;
  messages.value.push({
    content: "",
    isUser: false,
    time: new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    thinking: true,
  });

  // 滚动到底部
  await scrollToBottom();

  try {
    // 准备消息历史
    const messageHistory = messages.value
      .filter((msg) => !msg.thinking)
      .map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content,
      }));

    // 发送POST请求
    const response = await fetch("http://localhost:3000/api/ai-chat/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
      body: JSON.stringify({ messages: messageHistory }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    let aiResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 将 Uint8Array 转换为字符串
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            aiResponse += data.content;

            // 更新最后一条消息的内容
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage && !lastMessage.isUser) {
              lastMessage.content = aiResponse;
              lastMessage.thinking = false;
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e);
          }
        }
      }
    }

    // 保存会话
    await saveSession();

    isProcessing.value = false;
    scrollToBottom();
  } catch (error) {
    console.error("AI API error:", error);
    messages.value.pop(); // 移除思考中的消息

    // 添加错误消息
    messages.value.push({
      content: "抱歉，我遇到了一些问题，请稍后再试。",
      isUser: false,
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    isProcessing.value = false;
    scrollToBottom();
  }
};

// 从建议提示发送消息
const sendPromptMessage = (prompt: string) => {
  inputMessage.value = prompt;
  sendMessage();
};

// 清空对话
const clearConversation = () => {
  messages.value = [];
  if (!isAnonymous.value) {
    currentSessionId.value = "";
  }
};

// 保存设置
const saveSettings = () => {
  // 这里可以添加实际的设置保存逻辑
  showSettings.value = false;
  // 可以显示一个成功提示
};

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick();
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
  }
};

// 组件挂载后
onMounted(async () => {
  // 加载历史会话
  try {
    const response = await fetch("http://localhost:3000/api/ai-chat/sessions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      credentials: "include",
    });
    if (response.ok) {
      const sessions = await response.json();
      historySessions.value = sessions;
    }
  } catch (error) {
    console.error("Failed to load sessions:", error);
  }
});
</script>

<style scoped>
:deep(.el-drawer__header) {
  margin-bottom: 0;
}
:deep(.el-drawer__title) {
  font-size: 20px;
}
:deep(.el-drawer__header) {
  padding-bottom: 16px;
}
</style>
<style lang="scss" scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-main);
  color: var(--color-text-normal);
  overflow: hidden;
  height: 100%;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);

    .ai-info {
      display: flex;
      align-items: center;

      .ai-name {
        margin-left: 12px;
        font-weight: 600;
        font-size: 16px;
        color: var(--color-text-normal);
      }

      .ai-status {
        margin-left: 12px;
        font-size: 12px;
        color: var(--color-text-muted);
        display: flex;
        align-items: center;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;

          &.online {
            background-color: #3ba55d;
          }
        }
      }
    }

    .header-actions {
      display: flex;

      :deep(.el-button) {
        color: #b9bbbe;
        font-size: 18px;

        &:hover {
          color: var(--color-text-normal);
        }
      }
    }
  }

  .chat-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    .welcome-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 40px;

      .welcome-img {
        width: 120px;
        height: 120px;
        margin-bottom: 16px;
      }

      h2 {
        color: var(--color-text-normal);
        margin-bottom: 8px;
      }

      p {
        color: var(--color-text-muted);
        margin-bottom: 24px;
        max-width: 500px;
      }

      .suggestion-prompts {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        max-width: 600px;

        .prompt-item {
          background-color: var(--color-bg-main);
          padding: 8px 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: background-color 0.2s;

          &:hover {
            background-color: var(--color-primary-light);
          }
        }
      }
    }

    .message-item {
      display: flex;
      margin-bottom: 20px;

      .message-avatar {
        margin-right: 12px;
      }

      .message-content {
        background-color: var(--color-bg-message);
        padding: 12px 16px;
        border-radius: 0 8px 8px 8px;
        max-width: 80%;

        .message-sender {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
          color: var(--color-text-normal);

          .message-time {
            font-weight: normal;
            font-size: 12px;
            color: var(--color-text-muted);
            margin-left: 8px;
          }
        }

        .message-text {
          word-break: break-word;

          .markdown-content {
            color: inherit;
            font-size: inherit;
            line-height: 1.6;

            :deep(p) {
              margin: 0.5em 0;
            }

            :deep(ul),
            :deep(ol) {
              margin: 0.5em 0;
              padding-left: 1.5em;
            }

            :deep(li) {
              margin: 0.3em 0;
            }

            :deep(code) {
              background-color: rgba(0, 0, 0, 0.1);
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-family: monospace;
            }

            :deep(pre) {
              background-color: rgba(0, 0, 0, 0.1);
              padding: 1em;
              border-radius: 5px;
              overflow-x: auto;
              margin: 0.5em 0;

              code {
                background-color: transparent;
                padding: 0;
              }
            }

            :deep(blockquote) {
              border-left: 4px solid rgba(255, 255, 255, 0.2);
              margin: 0.5em 0;
              padding-left: 1em;
              color: rgba(255, 255, 255, 0.8);
            }

            :deep(h1),
            :deep(h2),
            :deep(h3),
            :deep(h4),
            :deep(h5),
            :deep(h6) {
              margin: 0.8em 0 0.4em;
              line-height: 1.4;
            }

            :deep(table) {
              border-collapse: collapse;
              margin: 0.5em 0;
              width: 100%;

              th,
              td {
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 0.5em;
              }

              th {
                background-color: rgba(255, 255, 255, 0.1);
              }
            }
          }
        }

        .thinking-indicator {
          display: flex;
          gap: 4px;

          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #b9bbbe;
            animation: thinking 1.4s infinite ease-in-out both;

            &:nth-child(1) {
              animation-delay: -0.32s;
            }

            &:nth-child(2) {
              animation-delay: -0.16s;
            }
          }
        }
      }

      &.user-message {
        flex-direction: row-reverse;

        .message-avatar {
          margin-right: 0;
          margin-left: 12px;
        }

        .message-content {
          background-color: #5865f2;
          border-radius: 8px 0 8px 8px;

          .message-text {
            color: white;
          }
        }
      }
    }
  }

  .chat-input-area {
    padding: 16px;
    background-color: var(--color-bg-main);

    .input-wrapper {
      background-color: var(--color-bg-main);
      border-radius: 8px;
      padding: 12px;

      :deep(.el-textarea__inner) {
        background-color: transparent;
        border: none;
        color: var(--color-text-normal);
        font-size: 14px;
        padding: 0;

        &:focus {
          box-shadow: none;
        }
      }

      .input-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 8px;

        :deep(.el-button) {
          color: #b9bbbe;

          &:hover:not(:disabled) {
            color: var(--color-text-normal);
          }

          &:disabled {
            color: #72767d;
          }
        }

        .send-button {
          background-color: var(--color-primary-light);
          color: var(--color-text-normal);
          border: none;

          &:hover:not(:disabled) {
            background-color: var(--color-primary-light);
          }

          &:disabled {
            background-color: var(--color-primary-light);
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
  }

  .settings-content {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      span {
        font-weight: 500;
      }

      :deep(.el-select) {
        width: 200px;
      }
    }
  }

  .history-list {
    padding: 16px;

    .history-item {
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-bottom: 8px;

      &:hover {
        background-color: var(--color-bg-hover);
      }

      &.active {
        background-color: var(--color-primary-light);
      }

      .session-title {
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--color-text-normal);
      }

      .session-time {
        font-size: 12px;
        color: var(--color-text-muted);
      }
    }
  }

  .history-actions {
    border-bottom: 1px solid var(--color-border);
  }
}

@keyframes thinking {
  0%,
  80%,
  100% {
    transform: scale(0.6);
  }
  40% {
    transform: scale(1);
  }
}
</style>
