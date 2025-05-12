import { defineStore } from "pinia";
import api from "@/api/chat";
import { ApiResponse } from "@/utils/request";

export interface Friend {
  _id: string;
  username: string;
  avatar: string;
  status: "online" | "offline" | "away" | "busy";
  lastActive?: string;
}

export interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
  };
  receiver: {
    _id: string;
    username: string;
    avatar: string;
  };
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface FriendsState {
  friends: Friend[];
  onlineFriends: string[];
  pendingRequests: FriendRequest[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export const useFriendsStore = defineStore("friends", {
  state: (): FriendsState => ({
    friends: [],
    onlineFriends: [],
    pendingRequests: [],
    isLoading: false,
    error: null,
    lastUpdated: 0,
  }),

  getters: {
    // 获取好友列表
    getFriendsList: (state) => state.friends,

    // 获取在线好友
    getOnlineFriends: (state) => {
      return state.friends.filter((friend) =>
        state.onlineFriends.includes(friend._id)
      );
    },

    // 获取离线好友
    getOfflineFriends: (state) => {
      return state.friends.filter(
        (friend) => !state.onlineFriends.includes(friend._id)
      );
    },

    // 根据ID获取好友
    getFriendById: (state) => (id: string) => {
      return state.friends.find((friend) => friend._id === id);
    },

    // 获取待处理好友请求
    getPendingRequests: (state) => state.pendingRequests,

    // 是否有好友请求
    hasPendingRequests: (state) => state.pendingRequests.length > 0,

    // 是否存储好友列表
    hasFriends: (state) => state.friends.length > 0,
  },

  actions: {
    // 加载好友列表
    async loadFriends(forceRefresh = false) {
      this.isLoading = true;
      this.error = null;

      try {
        // 检查是否强制刷新或数据过时
        const now = Date.now();
        const CACHE_TIME = 5 * 60 * 1000; // 5分钟
        const isCacheExpired = now - this.lastUpdated > CACHE_TIME;

        // 如果需要强制刷新或缓存已过期，使用无缓存版本
        const response =
          forceRefresh || isCacheExpired
            ? await api.getFriendsListNoCache()
            : await api.getFriendsList();

        if (response && response.success) {
          this.setFriends(response.data);
          this.lastUpdated = now;

          // 初始化在线好友列表
          this.onlineFriends = this.friends
            .filter((friend) => friend.status === "online")
            .map((friend) => friend._id);

          return response.data;
        } else {
          throw new Error(response?.message || "加载好友列表失败");
        }
      } catch (error: any) {
        console.error("加载好友列表失败:", error);
        this.error = error.message || "加载好友列表失败";
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    // 加载待处理的好友请求
    async loadPendingRequests() {
      this.isLoading = true;

      try {
        const response = await api.getPendingFriendRequests();

        if (response && response.success) {
          this.setPendingRequests(response.data);
          return response.data;
        } else {
          throw new Error(response?.message || "加载好友请求失败");
        }
      } catch (error: any) {
        console.error("加载好友请求失败:", error);
        this.error = error.message || "加载好友请求失败";
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    // 发送好友请求
    async sendFriendRequest(username: string) {
      this.isLoading = true;

      try {
        const response = await api.sendFriendRequest(username);

        if (response && response.success) {
          return true;
        } else {
          throw new Error(response?.message || "发送好友请求失败");
        }
      } catch (error: any) {
        console.error("发送好友请求失败:", error);
        this.error = error.message || "发送好友请求失败";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // 接受好友请求
    async acceptFriendRequest(requestId: string) {
      this.isLoading = true;

      try {
        const response = await api.acceptFriendRequest(requestId);

        if (response && response.success) {
          // 更新好友列表
          if (response.data.friend) {
            this.addFriend(response.data.friend);
          }

          // 从待处理列表中移除
          this.pendingRequests = this.pendingRequests.filter(
            (request) => request._id !== requestId
          );

          return true;
        } else {
          throw new Error(response?.message || "接受好友请求失败");
        }
      } catch (error: any) {
        console.error("接受好友请求失败:", error);
        this.error = error.message || "接受好友请求失败";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // 拒绝好友请求
    async rejectFriendRequest(requestId: string) {
      this.isLoading = true;

      try {
        const response = await api.rejectFriendRequest(requestId);

        if (response && response.success) {
          // 从待处理列表中移除
          this.pendingRequests = this.pendingRequests.filter(
            (request) => request._id !== requestId
          );

          return true;
        } else {
          throw new Error(response?.message || "拒绝好友请求失败");
        }
      } catch (error: any) {
        console.error("拒绝好友请求失败:", error);
        this.error = error.message || "拒绝好友请求失败";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // 设置好友列表
    setFriends(friends: Friend[]) {
      this.friends = friends;
    },

    // 添加单个好友
    addFriend(friend: Friend) {
      const exists = this.friends.some((f) => f._id === friend._id);
      if (!exists) {
        this.friends.push(friend);
      }
    },

    // 删除好友
    removeFriend(friendId: string) {
      this.friends = this.friends.filter((friend) => friend._id !== friendId);
      this.onlineFriends = this.onlineFriends.filter((id) => id !== friendId);
    },

    // 更新好友状态
    updateFriendStatus({
      userId,
      status,
    }: {
      userId: string;
      status: "online" | "offline";
    }) {
      // 更新好友状态
      const friend = this.friends.find((f) => f._id === userId);
      if (friend) {
        friend.status = status;
      }

      // 更新在线好友列表
      if (status === "online") {
        if (!this.onlineFriends.includes(userId)) {
          this.onlineFriends.push(userId);
        }
      } else {
        this.onlineFriends = this.onlineFriends.filter((id) => id !== userId);
      }
    },

    // 设置加载状态
    setLoading(isLoading: boolean) {
      this.isLoading = isLoading;
    },

    // 设置待处理好友请求
    setPendingRequests(requests: FriendRequest[]) {
      this.pendingRequests = requests;
    },

    // 更新好友信息
    updateFriendInfo(friendInfo: Partial<Friend> & { _id: string }) {
      const friendIndex = this.friends.findIndex(
        (f) => f._id === friendInfo._id
      );
      if (friendIndex !== -1) {
        this.friends[friendIndex] = {
          ...this.friends[friendIndex],
          ...friendInfo,
        };
      }
    },

    // 清除错误
    clearError() {
      this.error = null;
    },

    // 添加测试数据（开发环境使用）
    async initTestData() {
      // 如果已有好友数据，则不初始化
      if (this.friends.length > 0) return this.friends;

      // 开发环境模拟好友数据
      if (import.meta.env.DEV) {
        console.log("初始化测试好友数据");

        const testFriends: Friend[] = [
          {
            _id: "680c7804e40db6e6430ec67d",
            username: "测试用户1",
            avatar:
              "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
            status: "online",
          },
          {
            _id: "6819d6f2211bc0c3d6405ecf",
            username: "测试用户2",
            avatar:
              "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
            status: "offline",
          },
        ];

        this.friends = testFriends;
        this.onlineFriends = testFriends
          .filter((friend) => friend.status === "online")
          .map((friend) => friend._id);

        return testFriends;
      }

      // 非开发环境则尝试从API加载好友
      return this.loadFriends();
    },
  },
});
