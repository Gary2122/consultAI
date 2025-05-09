<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-09 11:52:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-09 12:49:34
-->
<template>
  <div class="friend-requests-panel">
    <div class="panel-header">
      <h2>好友申请</h2>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-refresh-right"
        @click="loadFriendRequests"
        :loading="loadingRequests"
        >刷新</el-button
      >
    </div>

    <div class="panel-content">
      <div v-if="loadingRequests" class="loading-container">
        <el-spinner />
      </div>

      <div v-else-if="pendingRequests.length === 0" class="empty-state">
        <i class="el-icon-message"></i>
        <p>暂无好友请求</p>
      </div>

      <div v-else class="request-list">
        <div
          v-for="request in pendingRequests"
          :key="request.id"
          class="request-item"
        >
          <div class="request-avatar">
            <el-avatar :size="50" :src="request.sender.avatar">
              {{ request.sender.username.substring(0, 1).toUpperCase() }}
            </el-avatar>
          </div>

          <div class="request-info">
            <div class="request-name">{{ request.sender.username }}</div>
            <div class="request-time">
              请求时间: {{ formatTime(request.createdAt) }}
            </div>
          </div>

          <div class="request-actions">
            <el-button
              type="success"
              size="small"
              @click="confirmFriendRequest(request.id)"
              :loading="request.loading"
              >接受</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="rejectFriendRequest(request.id)"
              :loading="request.loading"
              >拒绝</el-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import {
  loadFriendRequests,
  acceptRequest,
  rejectRequest,
} from "@/actions/friends";
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
const loadingRequests = ref(false);

// 初始化数据
onMounted(() => {
  loadFriendReqs();
});

// 加载好友请求
const loadFriendReqs = async () => {
  loadingRequests.value = true;
  pendingRequests.value = await loadFriendRequests();
  loadingRequests.value = false;
};

// 接受好友请求
const confirmFriendRequest = async (requestId: number | string) => {
  try {
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req.id === requestId
    );
    if (requestIndex !== -1) {
      pendingRequests.value[requestIndex].loading = true;
    }
    await acceptRequest(requestId);
    // 从列表中移除已处理的请求
    pendingRequests.value = pendingRequests.value.filter(
      (req) => req.id !== requestId
    );
  } catch (error) {
    // 重置加载状态
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req.id === requestId
    );
    if (requestIndex !== -1) {
      pendingRequests.value[requestIndex].loading = false;
    }
  }
};

// 拒绝好友请求
const rejectFriendRequest = async (requestId: number | string) => {
  try {
    // 找到请求并设置加载状态
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req.id === requestId
    );
    if (requestIndex !== -1) {
      pendingRequests.value[requestIndex].loading = true;
    }

    await rejectRequest(requestId);

    // 从列表中移除已处理的请求
    pendingRequests.value = pendingRequests.value.filter(
      (req) => req.id !== requestId
    );
  } catch (error) {
    // 重置加载状态
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req.id === requestId
    );
    if (requestIndex !== -1) {
      pendingRequests.value[requestIndex].loading = false;
    }
  }
};

// 格式化时间
const formatTime = (time: string | Date) => {
  try {
    // 简单格式化，无需额外库
    const date = new Date(time);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "未知时间";
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

// 左侧好友请求面板
.friend-requests-panel {
  width: 30%;
  border-right: 1px solid #202225;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #202225;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 16px;
      color: #ffffff;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .request-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .request-item {
    background-color: #2f3136;
    border-radius: 5px;
    padding: 16px;
    display: flex;
    align-items: center;
    position: relative;

    .request-avatar {
      margin-right: 16px;
    }

    .request-info {
      flex: 1;

      .request-name {
        color: #ffffff;
        font-weight: 500;
        margin-bottom: 5px;
        font-size: 16px;
      }

      .request-time {
        color: #b9bbbe;
        font-size: 12px;
      }
    }

    .request-actions {
      display: flex;
      gap: 8px;
    }
  }
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
