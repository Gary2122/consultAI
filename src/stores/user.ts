import { defineStore } from "pinia";
import socketService from "@/services/socket";
import { updateUserStatus } from "@/api/user";

export interface UserState {
  token: string | null;
  userId: string | null;
  username: string | null;
  avatar: string | null;
  status: string | null;
  privacySettings: {
    showOnlineStatus: boolean;
    onlineStatusVisibility: string;
    allowFriendRequests: boolean;
    showReadReceipts: boolean;
    allowAIAnalysis: boolean;
  } | null;
  isLoggedIn: boolean;
  anonymousName: string;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: null,
    userId: null,
    username: null,
    avatar: null,
    status: "offline",
    privacySettings: null,
    isLoggedIn: false,
    anonymousName: "",
  }),

  getters: {
    // 用户是否已登录
    loggedIn(state): boolean {
      return state.isLoggedIn && !!state.token;
    },

    // 获取用户信息
    userInfo(state) {
      return {
        userId: state.userId,
        username: state.username,
        avatar: state.avatar,
        status: state.status,
        anonymousName: state.anonymousName,
        privacySettings: state.privacySettings,
      };
    },

    // 用户是否在线
    isOnline(state): boolean {
      return state.status === "online";
    },

    // 用户是否显示在线状态
    showsOnlineStatus(state): boolean {
      return state.privacySettings?.showOnlineStatus || false;
    },
  },

  actions: {
    initUser() {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (user) {
        try {
          const userData = JSON.parse(user);
          this.setUserInfo(userData);

          // 如果有状态信息，设置状态
          if (userData.status) {
            this.status = userData.status;
          }

          // 如果有隐私设置，设置隐私设置
          if (userData.privacySettings) {
            this.privacySettings = userData.privacySettings;
          }
        } catch (error) {
          console.error("解析用户数据失败", error);
        }
      }

      if (token) {
        this.setToken(token);

        // 初始化SocketIO连接
        socketService.init();
        socketService.connect(token);
        console.log("Socket.IO服务初始化并连接");
      }
    },
    // 设置用户信息
    setUserInfo(userInfo: any) {
      this.userId = userInfo.id;
      this.username = userInfo.username;
      this.avatar = userInfo.avatar;
      this.anonymousName = userInfo.anonymousName;
      console.log(userInfo.anonymousName, this.anonymousName);
      console.log(userInfo);

      // 添加状态和隐私设置
      if (userInfo.status) {
        this.status = userInfo.status;
      }

      if (userInfo.privacySettings) {
        this.privacySettings = userInfo.privacySettings;
      }

      this.isLoggedIn = true;

      // 更新本地存储
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: this.userId,
          username: this.username,
          avatar: this.avatar,
          status: this.status,
          privacySettings: this.privacySettings,
          anonymousName: this.anonymousName,
        })
      );
    },

    // 设置用户token
    setToken(token: string) {
      this.token = token;
    },

    // 设置用户状态
    async setStatus(status: string) {
      if (!this.isLoggedIn) return;

      try {
        this.status = status;

        // 更新本地存储
        const userDataStr = localStorage.getItem("user");
        console.log("userDataStr", userDataStr);
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          userData.status = status;
          localStorage.setItem("user", JSON.stringify(userData));
        }

        // 如果socket已连接，通过socket更改状态
        if (socketService.isConnected.value) {
          // Socket更新已经在StatusSelector组件中完成
        } else {
          // 否则通过API更新状态
          await updateUserStatus(status);
        }
      } catch (error) {
        console.error("更新状态失败", error);
        // 状态更新失败时不要回滚，因为Socket服务可能仍在尝试连接
      }
    },

    // 更新隐私设置
    updatePrivacySettings(settings: Partial<UserState["privacySettings"]>) {
      if (!this.privacySettings) {
        this.privacySettings = {
          showOnlineStatus: true,
          onlineStatusVisibility: "friends",
          allowFriendRequests: true,
          showReadReceipts: true,
          allowAIAnalysis: true,
        };
      }

      // 更新设置
      this.privacySettings = {
        ...this.privacySettings,
        ...settings,
      };

      // 更新本地存储
      const userDataStr = localStorage.getItem("user");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.privacySettings = this.privacySettings;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    },

    // 更新头像
    updateAvatar(avatarUrl: string) {
      this.avatar = avatarUrl;

      // 更新本地存储
      const userDataStr = localStorage.getItem("user");
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.avatar = avatarUrl;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    },

    // 登出
    logout() {
      // 先设置为离线状态
      if (this.isLoggedIn && socketService.isConnected.value) {
        this.setStatus("offline");
      }

      // 等待一小段时间以确保状态更新被发送
      setTimeout(() => {
        this.token = null;
        this.userId = null;
        this.username = null;
        this.avatar = null;
        this.status = "offline";
        this.privacySettings = null;
        this.isLoggedIn = false;

        // 清理本地存储
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // 断开Socket连接
        socketService.disconnect();
      }, 300);
    },
  },
});
