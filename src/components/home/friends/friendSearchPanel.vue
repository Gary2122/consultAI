<template>
  <div class="search-panel">
    <div class="search-header">
      <div class="search-input-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或邮箱"
          prefix-icon="el-icon-search"
          clearable
          @keyup.enter="searchUsers"
        >
          <template #append>
            <el-button @click="searchUsers">搜索</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="search-content">
      <div class="search-results-header">
        <h2>搜索结果</h2>
      </div>

      <div v-if="loading" class="loading-container">
        <el-spinner />
      </div>

      <div v-else-if="!searchPerformed" class="empty-state">
        <i class="el-icon-search"></i>
        <p>请输入关键词搜索用户</p>
      </div>

      <div v-else-if="searchResults.length === 0" class="empty-state">
        <i class="el-icon-warning-outline"></i>
        <p>未找到匹配的用户</p>
      </div>

      <div v-else class="search-results">
        <div v-for="user in searchResults" :key="user._id" class="user-item">
          <div class="user-avatar">
            <el-avatar :size="50" :src="user.avatar">
              {{ user.username.substring(0, 1).toUpperCase() }}
            </el-avatar>
            <div
              v-if="user.status"
              class="status-indicator"
              :class="user.status === 'online' ? 'online' : 'offline'"
            ></div>
          </div>

          <div class="user-info">
            <div class="user-name">{{ user.username }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>

          <div class="user-actions">
            <el-button
              v-if="user.relationStatus === 'none'"
              type="primary"
              size="small"
              @click="sendRequest(user._id)"
              :loading="user.loading"
              >添加好友</el-button
            >

            <el-button
              v-else-if="user.relationStatus === 'pending'"
              type="info"
              size="small"
              disabled
              >请求已发送</el-button
            >

            <el-button
              v-else-if="user.relationStatus === 'friend'"
              type="success"
              size="small"
              disabled
              >已是好友</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import {
  searchUsers as apiSearchUsers,
  sendFriendRequest,
  getFriendsList,
} from "@/api/friends";

// 数据结构接口定义
interface User {
  _id: string; // MongoDB格式的ID
  username: string;
  email: string;
  avatar: string;
  status?: string; // online/offline
  lastActive?: string;
  relationStatus?: "none" | "pending" | "friend";
  loading?: boolean;
}

interface FriendRequest {
  id: number | string;
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "rejected";
  createdAt: string | Date;
  loading?: boolean;
}

// 好友请求列表状态
const pendingRequests = ref<FriendRequest[]>([]);

// 搜索状态
const searchQuery = ref("");
const searchResults = ref<User[]>([]);
const loading = ref(false);
const searchPerformed = ref(false);

// 搜索用户
const searchUsers = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning("请输入搜索关键词");
    return;
  }

  try {
    loading.value = true;
    searchPerformed.value = true;

    const response = await apiSearchUsers(searchQuery.value.trim());

    // 加载好友列表以比较状态
    const friendsResponse = await getFriendsList();
    const friendsList = friendsResponse.data || [];

    // 处理数据，标记用户状态
    searchResults.value = response.data.map((user: User) => {
      // 检查是否已经是好友
      const isFriend = friendsList.some(
        (friend: any) => friend._id === user._id
      );

      // 检查是否已发送请求
      const isPending = pendingRequests.value.some(
        (request) =>
          request.sender._id === user._id ||
          (request.receiver && request.receiver._id === user._id)
      );

      return {
        ...user,
        relationStatus: isFriend ? "friend" : isPending ? "pending" : "none",
        loading: false,
      };
    });
  } catch (error) {
    console.error("搜索用户失败:", error);
    ElMessage.error("搜索用户失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 发送好友请求
const sendRequest = async (userId: string) => {
  try {
    // 找到用户并设置加载状态
    const userIndex = searchResults.value.findIndex(
      (user) => user._id === userId
    );
    if (userIndex !== -1) {
      searchResults.value[userIndex].loading = true;
    }

    await sendFriendRequest(userId);

    // 更新用户状态
    if (userIndex !== -1) {
      searchResults.value[userIndex].relationStatus = "pending";
      searchResults.value[userIndex].loading = false;
    }

    ElMessage.success("好友请求已发送");
  } catch (error) {
    console.error("发送好友请求失败:", error);
    ElMessage.error("发送请求失败，请重试");

    // 重置加载状态
    const userIndex = searchResults.value.findIndex(
      (user) => user._id === userId
    );
    if (userIndex !== -1) {
      searchResults.value[userIndex].loading = false;
    }
  }
};
</script>

<style scoped lang="scss">
.notice-container {
  display: flex;
  height: 100vh;
  background-color: #36393f;
  color: #dcddde;
}

// 右侧搜索区域
.search-panel {
  flex: 1;
  display: flex;
  flex-direction: column;

  .search-header {
    padding: 16px;
    border-bottom: 1px solid #202225;

    .search-input-container {
      max-width: 600px;
      margin: 0 auto;

      :deep(.el-input__inner) {
        background-color: #40444b;
        border: none;
        color: #dcddde;

        &::placeholder {
          color: #72767d;
        }
      }
    }
  }

  .search-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;

    .search-results-header {
      margin-bottom: 16px;

      h2 {
        margin: 0;
        font-size: 16px;
        color: #ffffff;
      }
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .user-item {
      background-color: #2f3136;
      border-radius: 5px;
      padding: 16px;
      display: flex;
      align-items: center;

      .user-avatar {
        margin-right: 16px;
        position: relative;

        .status-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #36393f;

          &.online {
            background-color: #43b581;
          }

          &.offline {
            background-color: #747f8d;
          }
        }
      }

      .user-info {
        flex: 1;

        .user-name {
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 5px;
          font-size: 16px;
        }

        .user-email {
          color: #b9bbbe;
          font-size: 12px;
        }
      }
    }
  }
}

// 通用样式
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #72767d;

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
  }
}

:deep(.el-button--primary) {
  background-color: #5865f2;
  border-color: #5865f2;

  &:hover,
  &:focus {
    background-color: #4752c4;
    border-color: #4752c4;
  }
}

:deep(.el-button--danger) {
  background-color: #ed4245;
  border-color: #ed4245;

  &:hover,
  &:focus {
    background-color: #c03c3f;
    border-color: #c03c3f;
  }
}

:deep(.el-button--success) {
  background-color: #43b581;
  border-color: #43b581;

  &:hover,
  &:focus {
    background-color: #3ca374;
    border-color: #3ca374;
  }
}
</style>
