<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-28 14:25:41
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-15 13:02:53
-->
<template>
  <div class="ai-chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="ai-info">
        <el-avatar :size="40" src="/src/assets/img/home/avartal.jpg" />
        <div>
          <div class="ai-name">心理AI助手</div>
          <div class="ai-status">
            <span class="status-dot online"></span>
            在线
          </div>
        </div>
      </div>
      <div class="header-actions">
        <el-tooltip content="清空对话" placement="bottom">
          <el-button
            type="text"
            icon="el-icon-delete"
            @click="clearConversation"
          ></el-button>
        </el-tooltip>
        <el-tooltip content="设置" placement="bottom">
          <el-button
            type="text"
            icon="el-icon-setting"
            @click="showSettings = true"
          ></el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 聊天内容区 -->
    <div class="chat-content" ref="chatContentRef">
      <!-- 欢迎消息 -->
      <div class="welcome-message" v-if="messages.length === 0">
        <img
          src="/src/assets/img/home/avartal.jpg"
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
                  ? '/src/assets/img/home/avartal.jpg'
                  : '/src/assets/img/home/avartal.jpg'
              "
            />
          </div>
          <div class="message-content">
            <div class="message-sender">
              {{ msg.isUser ? "你" : "AI心理助手" }}
              <span class="message-time">{{ msg.time }}</span>
            </div>
            <div class="message-text" v-if="!msg.thinking">
              {{ msg.content }}
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

// 消息类型定义
interface Message {
  content: string;
  isUser: boolean;
  time: string;
  thinking?: boolean;
}

// 响应式状态
const inputMessage = ref("");
const messages = ref<Message[]>([]);
const isProcessing = ref(false);
const chatContentRef = ref<HTMLElement | null>(null);
const showSettings = ref(false);

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

// 发送消息到AI
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isProcessing.value) return;

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
  const userInput = inputMessage.value;
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

  // 模拟API调用
  try {
    // 这里应该是实际的API调用
    // const response = await callAiApi(userInput);

    // 模拟延迟
    setTimeout(() => {
      // 移除思考中的消息
      messages.value.pop();

      // 添加AI回复
      messages.value.push({
        content: generateAiResponse(userInput),
        isUser: false,
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      isProcessing.value = false;
      scrollToBottom();
    }, 1500);
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

// 生成模拟AI回复
const generateAiResponse = (userInput: string): string => {
  const lowercaseInput = userInput.toLowerCase();

  if (lowercaseInput.includes("焦虑")) {
    return "焦虑是一种常见的情绪反应。我建议你可以尝试深呼吸练习、正念冥想或渐进式肌肉放松技术来缓解焦虑。保持规律的体育锻炼、充足的睡眠和健康的饮食也很重要。如果焦虑严重影响到你的日常生活，建议咨询专业心理医生。";
  } else if (lowercaseInput.includes("睡眠")) {
    return "改善睡眠质量的方法包括：保持规律的作息时间、睡前避免使用电子设备、创造舒适的睡眠环境、避免晚间摄入咖啡因和酒精、睡前做些放松活动如阅读或泡温水澡。如果长期存在睡眠问题，建议咨询专业医生。";
  } else if (
    lowercaseInput.includes("压力") ||
    lowercaseInput.includes("工作")
  ) {
    return "工作压力是现代生活中的常见挑战。你可以尝试设定合理的目标和界限、学习时间管理技巧、定期休息、寻求同事或上级的支持、培养工作外的兴趣爱好来平衡生活。记住，适当的压力是正常的，但持续的过度压力需要及时处理。";
  } else if (
    lowercaseInput.includes("人际") ||
    lowercaseInput.includes("冲突")
  ) {
    return '处理人际冲突时，保持平和的沟通态度很重要。尝试用"我"陈述句表达感受，而不是指责对方；积极倾听对方的观点；寻找共同点而非分歧；必要时寻求第三方调解。记住，健康的关系不是没有冲突，而是能够妥善处理冲突。';
  } else {
    return "感谢你的分享。作为你的心理AI助手，我理解你的感受很重要。你能再多告诉我一些细节吗？这样我可以提供更有针对性的建议和支持。";
  }
};

// 清空对话
const clearConversation = () => {
  messages.value = [];
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
onMounted(() => {
  // 可以在这里添加初始化逻辑，例如加载历史消息
});
</script>

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
        background-color: #40444b;
        padding: 12px 16px;
        border-radius: 0 8px 8px 8px;
        max-width: 80%;

        .message-sender {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
          color: white;

          .message-time {
            font-weight: normal;
            font-size: 12px;
            color: #72767d;
            margin-left: 8px;
          }
        }

        .message-text {
          word-break: break-word;
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
