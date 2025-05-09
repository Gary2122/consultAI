import { Module } from "vuex";
import { RootState } from "../index";
import api from "@/api/chat";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
  messageType: "text" | "image";
  pending?: boolean; // 前端临时状态：消息是否正在发送
  failed?: boolean; // 前端临时状态：消息是否发送失败
}

export interface ChatState {
  connected: boolean; // WebSocket连接状态
  currentChatId: string | null; // 当前聊天的用户ID
  messages: Record<string, Message[]>; // 所有聊天消息，以聊天对象ID为键
  typingUsers: Record<string, boolean>; // 正在输入状态的用户
  unreadCounts: Record<string, number>; // 未读消息计数
  chatLoading: boolean; // 加载历史消息状态
}

// 初始化状态
const state: ChatState = {
  connected: false,
  currentChatId: null,
  messages: {},
  typingUsers: {},
  unreadCounts: {},
  chatLoading: false,
};

// 聊天模块
const chat: Module<ChatState, RootState> = {
  namespaced: true,
  state,
  getters: {
    // 获取当前聊天的消息
    currentMessages: (state) => {
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
    totalUnreadCount: (state) => {
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
  mutations: {
    // 设置WebSocket连接状态
    SET_CONNECTION_STATE(state, connected: boolean) {
      state.connected = connected;
    },

    // 设置当前聊天ID
    SET_CURRENT_CHAT(state, userId: string) {
      state.currentChatId = userId;

      // 将所有消息设为已读
      if (userId && state.messages[userId]) {
        state.messages[userId].forEach((msg) => {
          if (msg.senderId === userId && !msg.read) {
            msg.read = true;
          }
        });

        // 重置未读消息计数
        state.unreadCounts[userId] = 0;
      }
    },

    // 添加新消息
    ADD_MESSAGE(state, message: Message) {
      const chatId =
        message.senderId === state.currentChatId
          ? message.senderId
          : message.receiverId === state.currentChatId
          ? message.receiverId
          : message.senderId;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      // 检查消息是否已存在（避免重复）
      const messageExists = state.messages[chatId].some(
        (msg) => msg._id === message._id
      );

      if (!messageExists) {
        state.messages[chatId].push(message);

        // 如果不是当前聊天，增加未读计数
        if (
          chatId !== state.currentChatId &&
          message.senderId === chatId &&
          !message.read
        ) {
          if (!state.unreadCounts[chatId]) {
            state.unreadCounts[chatId] = 0;
          }
          state.unreadCounts[chatId]++;
        }

        // 按时间排序
        state.messages[chatId].sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    },

    // 更新消息
    UPDATE_MESSAGE(state, message: Message) {
      const chatId = message.receiverId;

      if (state.messages[chatId]) {
        const index = state.messages[chatId].findIndex(
          (msg) => msg._id === message._id
        );

        if (index !== -1) {
          state.messages[chatId][index] = {
            ...state.messages[chatId][index],
            ...message,
            pending: false,
            failed: false,
          };
        }
      }
    },

    // 标记消息为已读
    MARK_MESSAGE_READ(state, messageId: string) {
      Object.keys(state.messages).forEach((chatId) => {
        const index = state.messages[chatId].findIndex(
          (msg) => msg._id === messageId
        );

        if (index !== -1) {
          state.messages[chatId][index].read = true;
        }
      });
    },

    // 设置用户输入状态
    SET_USER_TYPING(state, { userId, isTyping }) {
      state.typingUsers = {
        ...state.typingUsers,
        [userId]: isTyping,
      };
    },

    // 设置加载状态
    SET_LOADING(state, loading: boolean) {
      state.chatLoading = loading;
    },

    // 设置消息为待处理状态（正在发送）
    SET_MESSAGE_PENDING(state, { chatId, messageId, pending }) {
      if (state.messages[chatId]) {
        const index = state.messages[chatId].findIndex(
          (msg) => msg._id === messageId
        );

        if (index !== -1) {
          state.messages[chatId][index].pending = pending;
        }
      }
    },

    // 设置消息为发送失败状态
    SET_MESSAGE_FAILED(state, { chatId, messageId, failed }) {
      if (state.messages[chatId]) {
        const index = state.messages[chatId].findIndex(
          (msg) => msg._id === messageId
        );

        if (index !== -1) {
          state.messages[chatId][index].failed = failed;
          state.messages[chatId][index].pending = false;
        }
      }
    },

    // 添加临时消息（尚未从服务器确认）
    ADD_TEMP_MESSAGE(state, message: Message) {
      const chatId = message.receiverId;

      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }

      state.messages[chatId].push({
        ...message,
        pending: true,
      });

      // 按时间排序
      state.messages[chatId].sort((a, b) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
    },

    // 重置聊天状态
    RESET_STATE(state) {
      state.connected = false;
      state.currentChatId = null;
      state.messages = {};
      state.typingUsers = {};
      state.unreadCounts = {};
      state.chatLoading = false;
    },
  },
  actions: {
    // 加载历史聊天记录
    async loadChatHistory({ commit, state }, userId: string) {
      if (state.chatLoading) return;

      commit("SET_LOADING", true);

      try {
        const response = await api.getChatHistory(userId);
        const messages = response.data;

        // 添加所有消息
        messages.forEach((message) => {
          commit("ADD_MESSAGE", message);
        });

        return messages;
      } catch (error) {
        console.error("加载历史聊天记录失败:", error);
        throw error;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // 切换到聊天
    async switchToChat({ commit, dispatch }, userId: string) {
      commit("SET_CURRENT_CHAT", userId);
      await dispatch("loadChatHistory", userId);
    },

    // 发送消息
    async sendMessage(
      { commit, rootState },
      { receiverId, content, messageType = "text" }
    ) {
      // 创建临时消息ID（后端会替换）
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // 创建临时消息对象
      const tempMessage: Message = {
        _id: tempId,
        senderId: rootState.user.userId, // 从用户状态获取当前用户ID
        receiverId,
        content,
        messageType,
        createdAt: new Date().toISOString(),
        read: false,
        pending: true,
      };

      // 添加临时消息到状态
      commit("ADD_TEMP_MESSAGE", tempMessage);

      return tempId;
    },

    // 标记消息发送成功
    messageConfirmed({ commit }, { tempId, message }) {
      const chatId = message.receiverId;

      // 更新临时消息为已确认
      commit("UPDATE_MESSAGE", {
        ...message,
        pending: false,
      });
    },

    // 标记消息发送失败
    messageFailure({ commit }, { chatId, messageId }) {
      commit("SET_MESSAGE_FAILED", { chatId, messageId, failed: true });
    },

    // 重新尝试发送失败的消息
    retryMessage({ commit }, { chatId, messageId }) {
      commit("SET_MESSAGE_FAILED", { chatId, messageId, failed: false });
      commit("SET_MESSAGE_PENDING", { chatId, messageId, pending: true });

      // 实际重发逻辑交给WebSocket服务处理
    },
  },
};

export default chat;
