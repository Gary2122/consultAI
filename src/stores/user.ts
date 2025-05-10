import { defineStore } from "pinia";

export interface UserState {
  token: string | null;
  userId: string | null;
  username: string | null;
  avatar: string | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    token: null,
    userId: null,
    username: null,
    avatar: null,
    isLoggedIn: false,
  }),

  getters: {
    // 用户是否已登录
    loggedIn(state): boolean {
      return state.isLoggedIn && !!state.token;
    },

    // 获取用户信息
    userInfo(state) {
      return {
        userId: state.id,
        username: state.username,
        avatar: state.avatar,
      };
    },
  },

  actions: {
    initUser() {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (user) {
        this.setUserInfo(JSON.parse(user));
      }
      if (token) {
        this.setToken(token);
      }
    },
    // 设置用户信息
    setUserInfo(userInfo: { id: string; username: string; avatar: string }) {
      this.userId = userInfo.id;
      this.username = userInfo.username;
      this.avatar = userInfo.avatar;
      this.isLoggedIn = true;
    },

    // 设置用户token
    setToken(token: string) {
      this.token = token;
    },

    // 登出
    logout() {
      this.token = null;
      this.userId = null;
      this.username = null;
      this.avatar = null;
      this.isLoggedIn = false;
    },

    // 初始化模拟用户数据（仅用于开发测试）
    // initMockUser() {
    //   this.token = "mock-token";
    //   this.id = "user-1";
    //   this.username = "测试用户";
    //   this.avatar =
    //     "https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png";
    //   this.isLoggedIn = true;
    // },
  },
});
