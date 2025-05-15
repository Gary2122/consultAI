<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-09 11:52:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-15 12:36:24
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
          :key="request._id"
          class="request-item"
        >
          <div class="request-avatar">
            <el-avatar :size="50" :src="request.requester.avatar">
              {{ request.requester.username.substring(0, 1).toUpperCase() }}
            </el-avatar>
          </div>

          <div class="request-info">
            <div class="request-name">{{ request.requester.username }}</div>
            <div class="request-time">
              请求时间: {{ formatTime(request.createdAt) }}
            </div>
          </div>

          <div class="request-actions">
            <el-button
              type="success"
              size="small"
              @click="confirmFriendRequest(request._id)"
              :loading="request.loading"
              >接受</el-button
            >
            <el-button
              type="danger"
              size="small"
              @click="rejectFriendRequest(request._id)"
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
  _id: number | string;
  requester: User;
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
  console.log(pendingRequests.value);
  loadingRequests.value = false;
};

// 接受好友请求
const confirmFriendRequest = async (requestId: number | string) => {
  try {
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req._id === requestId
    );
    if (requestIndex !== -1) {
      pendingRequests.value[requestIndex].loading = true;
    }
    await acceptRequest(requestId);
    // 从列表中移除已处理的请求
    pendingRequests.value = pendingRequests.value.filter(
      (req) => req._id !== requestId
    );
  } catch (error) {
    // 重置加载状态
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req._id === requestId
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
      (req) => req._id === requestId
    );
    if (requestIndex !== -1) {
      pendingRequests.value[requestIndex].loading = true;
    }

    await rejectRequest(requestId);

    // 从列表中移除已处理的请求
    pendingRequests.value = pendingRequests.value.filter(
      (req) => req._id !== requestId
    );
  } catch (error) {
    // 重置加载状态
    const requestIndex = pendingRequests.value.findIndex(
      (req) => req._id === requestId
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
  background-color: var(--color-bg-main);
  color: var(--color-text-normal);
}

// 左侧好友请求面板
.friend-requests-panel {
  width: 30%;
  border-right: 1px solid var(--color-border-main);
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid var(--color-border-main);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      font-size: 16px;
      color: var(--color-text-normal);
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
    background-color: var(--color-bg-main);
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
        color: var(--color-text-normal);
        font-weight: 500;
        margin-bottom: 5px;
        font-size: 16px;
      }

      .request-time {
        color: var(--color-text-muted);
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
    border-bottom: 1px solid var(--color-border-main);

    .search-input-container {
      max-width: 600px;
      margin: 0 auto;

      :deep(.el-input__inner) {
        background-color: var(--color-bg-main);
        border: none;
        color: var(--color-text-normal);

        &::placeholder {
          color: var(--color-text-muted);
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
        color: var(--color-text-normal);
      }
    }

    .search-results {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .user-item {
      background-color: var(--color-bg-main);
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
          color: var(--color-text-normal);
          font-weight: 500;
          margin-bottom: 5px;
          font-size: 16px;
        }

        .user-email {
          color: var(--color-text-muted);
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
  color: var(--color-text-muted);

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
  }
}

:deep(.el-button--primary) {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary-light);

  &:hover,
  &:focus {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-light);
  }
}

:deep(.el-button--danger) {
  background-color: var(--color-danger-light);
  border-color: var(--color-danger-light);

  &:hover,
  &:focus {
    background-color: var(--color-danger-light);
    border-color: var(--color-danger-light);
  }
}

:deep(.el-button--success) {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary-light);

  &:hover,
  &:focus {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-light);
  }
}
</style>
