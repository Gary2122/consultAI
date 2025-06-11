import { defineStore } from "pinia";
import * as groupApi from "@/api/group";
import { useChatStore } from "./chat";
import { useUserStore } from "./user";
import socketService from "@/services/socket";

export interface GroupMember {
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
  role: "admin" | "moderator" | "member";
  joinedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  creator: {
    _id: string;
    username: string;
    avatar: string;
  };
  members: GroupMember[];
  isPrivate: boolean;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupState {
  groups: Group[];
  currentGroupId: string | null;
  loading: boolean;
  error: string | null;
}

export const useGroupStore = defineStore("group", {
  state: (): GroupState => ({
    groups: [],
    currentGroupId: null,
    loading: false,
    error: null,
  }),

  getters: {
    // 获取当前选中的群组
    currentGroup(state): Group | null {
      if (!state.currentGroupId) return null;
      return state.groups.find((g) => g._id === state.currentGroupId) || null;
    },

    // 获取所有群组
    allGroups(state): Group[] {
      return state.groups;
    },

    // 根据ID获取群组
    getGroupById:
      (state) =>
      (id: string): Group | undefined => {
        return state.groups.find((g) => g._id === id);
      },

    // 获取当前用户在群组中的角色
    getCurrentUserRole:
      (state) =>
      (userId: string): string | null => {
        const group = state.currentGroupId
          ? state.groups.find((g) => g._id === state.currentGroupId)
          : null;

        if (!group) return null;

        const member = group.members.find((m) => m.user._id === userId);
        return member ? member.role : null;
      },

    // 检查用户是否是群组管理员
    isGroupAdmin:
      (state) =>
      (groupId: string, userId: string): boolean => {
        const group = state.groups.find((g) => g._id === groupId);
        if (!group) return false;

        const member = group.members.find((m) => m.user._id === userId);
        return member?.role === "admin";
      },
  },

  actions: {
    // 设置当前群组ID
    setCurrentGroup(groupId: string | null) {
      this.currentGroupId = groupId;
    },

    // 加载用户的所有群组
    async loadUserGroups() {
      this.loading = true;
      this.error = null;
      try {
        if (this.groups.length === 0) {
          const groups = await groupApi.getUserGroups();
          console.log("groups", groups);
          this.groups = groups;
        }
        return this.groups;
      } catch (error: any) {
        this.error = error.response?.data?.message || "加载群组失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 创建新群组
    async createGroup(groupData: {
      name: string;
      description?: string;
      isPrivate?: boolean;
    }) {
      this.loading = true;
      this.error = null;
      try {
        const newGroup = await groupApi.createGroup(groupData);
        this.groups.push(newGroup);
        return newGroup;
      } catch (error: any) {
        this.error = error.response?.data?.message || "创建群组失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 更新群组信息
    async updateGroup(
      groupId: string,
      updateData: {
        name?: string;
        description?: string;
        avatar?: string;
        isPrivate?: boolean;
      }
    ) {
      this.loading = true;
      this.error = null;
      try {
        const updatedGroup = await groupApi.updateGroup(groupId, updateData);
        const index = this.groups.findIndex((g) => g._id === groupId);
        if (index !== -1) {
          this.groups[index] = updatedGroup;
        }
        return updatedGroup;
      } catch (error: any) {
        this.error = error.response?.data?.message || "更新群组失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 删除群组
    async deleteGroup(groupId: string) {
      this.loading = true;
      this.error = null;
      try {
        await groupApi.deleteGroup(groupId);
        this.groups = this.groups.filter((g) => g._id !== groupId);
        if (this.currentGroupId === groupId) {
          this.currentGroupId = null;
        }
        return true;
      } catch (error: any) {
        this.error = error.response?.data?.message || "删除群组失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 添加群组成员
    async addGroupMember(groupId: string, userId: string, role = "member") {
      this.loading = true;
      this.error = null;
      try {
        const updatedGroup = await groupApi.addGroupMember(
          groupId,
          userId,
          role
        );
        const index = this.groups.findIndex((g) => g._id === groupId);
        if (index !== -1) {
          this.groups[index] = updatedGroup;
        }
        return updatedGroup;
      } catch (error: any) {
        this.error = error.response?.data?.message || "添加群组成员失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 移除群组成员
    async removeGroupMember(groupId: string, userId: string) {
      this.loading = true;
      this.error = null;
      try {
        const updatedGroup = await groupApi.removeGroupMember(groupId, userId);
        const index = this.groups.findIndex((g) => g._id === groupId);
        if (index !== -1) {
          this.groups[index] = updatedGroup;
        }
        return updatedGroup;
      } catch (error: any) {
        this.error = error.response?.data?.message || "移除群组成员失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取群组成员
    async getGroupMembers(groupId: string) {
      this.error = null;
      try {
        const members = await groupApi.getGroupMembers(groupId);
        return members;
      } catch (error: any) {
        this.error = error.response?.data?.message || "获取群组成员失败";
        throw error;
      }
    },

    // 加载群组消息
    async loadGroupMessages(groupId: string) {
      this.error = null;
      const chatStore = useChatStore();
      try {
        const messages = await groupApi.getGroupMessages(groupId);

        // 将消息转换为聊天存储中使用的格式
        for (const message of messages) {
          const formattedMessage = chatStore.convertMessageFormat(message);
          chatStore.addMessage(formattedMessage);
        }

        return messages;
      } catch (error: any) {
        this.error = error.response?.data?.message || "加载群组消息失败";
        throw error;
      }
    },

    // 发送群组消息
    async sendGroupMessage({
      groupId,
      content,
      contentType = "text",
      fileUrl = null,
      isAnonymous = false,
    }: {
      groupId: string;
      content: string;
      contentType?: "text" | "image" | "file";
      fileUrl?: string | null;
      isAnonymous?: boolean;
    }) {
      const chatStore = useChatStore();
      const userStore = useUserStore();
      this.error = null;

      try {
        // 检查用户是否已登录
        if (!userStore.userId || !userStore.username) {
          throw new Error("用户未登录或登录信息不完整");
        }

        // 检查当前群组是否存在
        const group = this.groups.find((g) => g._id === groupId);
        if (!group) {
          throw new Error("群组不存在");
        }

        // 检查用户是否是群组成员
        const isMember = group.members.some(
          (m) => m.user && m.user._id && m.user._id === userStore.userId
        );
        if (!isMember) {
          throw new Error("您不是该群组的成员");
        }

        console.log("User info:", {
          userId: userStore.userId,
          username: userStore.username,
        });
        console.log("Group info:", group);
        console.log("Is member:", isMember);
        console.log("anonymousName", userStore.anonymousName);

        // 创建临时消息(未发送状态)
        const tempMessage = {
          _id: `temp_${Date.now()}`,
          senderId: userStore.userId,
          receiverId: groupId,
          content,
          createdAt: new Date().toISOString(),
          read: false,
          messageType: contentType,
          sender: isAnonymous ? userStore.anonymousName : userStore.username,
          avatar: isAnonymous ? "" : userStore.avatar || "",
          fileUrl,
          isDeleted: false,
          updatedAt: new Date().toISOString(),
          isSelf: true,
          pending: true,
          isGroupMessage: true,
          isAnonymous,
          senderInfo: {
            _id: userStore.userId,
            username: isAnonymous
              ? userStore.anonymousName
              : userStore.username,
            avatar: isAnonymous ? "" : userStore.avatar || "",
          },
        };

        // 添加临时消息到聊天记录
        chatStore.addMessage(tempMessage);

        // 使用Socket.IO发送消息
        const result = socketService.sendGroupMessage(
          groupId,
          content,
          contentType,
          fileUrl,
          null,
          isAnonymous,
          userStore.anonymousName
        );

        if (!result) {
          // 如果发送失败，将消息标记为失败
          chatStore.messageFailure({
            chatId: groupId,
            messageId: tempMessage._id,
          });
          throw new Error("发送消息失败，请检查网络连接");
        }

        return true;
      } catch (error: any) {
        this.error = error.message || "发送群组消息失败";
        throw error;
      }
    },

    // 处理收到新成员加入群组事件
    handleMemberJoined(data: { groupId: string; user: any }) {
      const { groupId, user } = data;
      const group = this.groups.find((g) => g._id === groupId);
      if (group) {
        // 检查成员是否已经存在
        const memberExists = group.members.some((m) => m.user._id === user.id);
        if (!memberExists) {
          group.members.push({
            user: {
              _id: user.id,
              username: user.username,
              avatar: user.avatar,
            },
            role: "member",
            joinedAt: new Date().toISOString(),
          });
        }
      }
    },

    // 处理成员离开群组事件
    handleMemberLeft(data: { groupId: string; userId: string }) {
      const { groupId, userId } = data;
      const group = this.groups.find((g) => g._id === groupId);
      if (group) {
        group.members = group.members.filter((m) => m.user._id !== userId);
      }
    },

    // 加入群组
    joinGroup(groupId: string) {
      return socketService.joinGroup(groupId);
    },

    // 离开群组
    leaveGroup(groupId: string) {
      return socketService.leaveGroup(groupId);
    },

    // 重置状态
    resetState() {
      this.groups = [];
      this.currentGroupId = null;
      this.loading = false;
      this.error = null;
    },
  },
});
