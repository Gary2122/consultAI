<template>
  <div class="status-selector">
    <el-dropdown trigger="click" @command="handleStatusChange">
      <div class="status-display">
        <span class="status-dot" :class="[currentStatus]"></span>
        <span class="status-text">{{ statusText }}</span>
        <i class="el-icon-arrow-down"></i>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="online">
            <div class="status-option">
              <span class="status-dot online"></span>
              <span>在线</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="away">
            <div class="status-option">
              <span class="status-dot away"></span>
              <span>离开</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="busy">
            <div class="status-option">
              <span class="status-dot busy"></span>
              <span>勿扰</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item command="offline">
            <div class="status-option">
              <span class="status-dot offline"></span>
              <span>隐身</span>
            </div>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <div class="privacy-option" @click.stop="goToPrivacySettings">
              <i class="el-icon-setting"></i>
              <span>设置在线状态隐私</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import socketService from "@/services/socket";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();

const currentStatus = ref(userStore.status || "offline");

// 监听用户状态变化
watch(
  () => userStore.status,
  (newStatus) => {
    if (newStatus) {
      currentStatus.value = newStatus;
    }
  }
);

// 获取状态对应的文本
const statusText = computed(() => {
  const statusMap: Record<string, string> = {
    online: "在线",
    away: "离开",
    busy: "勿扰",
    offline: "隐身",
  };
  return statusMap[currentStatus.value] || "在线";
});

// 处理状态变更
const handleStatusChange = async (status: string) => {
  if (status === currentStatus.value) return;

  try {
    // 更新本地状态
    currentStatus.value = status;

    // 通过Socket.IO发送状态变更
    if (socketService.isConnected.value) {
      // 发送状态变更请求
      socketService.socket?.emit("status:change", { status });
    } else {
      ElMessage.warning("网络连接已断开，状态可能未同步");
    }

    // 更新store中的状态
    userStore.setStatus(status);
  } catch (error) {
    console.error("更新状态失败:", error);
    ElMessage.error("更新状态失败，请重试");
    // 恢复之前的状态
    currentStatus.value = userStore.status || "offline";
  }
};

// 跳转到隐私设置页面
const goToPrivacySettings = () => {
  router.push("/settings/privacy");
};

onMounted(() => {
  // 初始化为用户当前状态
  currentStatus.value = userStore.status || "offline";
});
</script>

<style lang="scss" scoped>
.status-selector {
  cursor: pointer;

  .status-display {
    display: flex;
    align-items: center;
    padding: 5px 8px;
    border-radius: 4px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .status-text {
      margin: 0 5px;
      font-size: 14px;
      color: var(--color-text-normal);
    }
  }
}

.status-option {
  display: flex;
  align-items: center;
  padding: 5px 0;

  span {
    margin-left: 8px;
  }
}

.privacy-option {
  display: flex;
  align-items: center;
  padding: 5px 0;

  i {
    margin-right: 8px;
    font-size: 16px;
  }
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;

  &.online {
    background-color: #3ba55d; // Green
  }

  &.away {
    background-color: #faa81a; // Yellow
  }

  &.busy {
    background-color: #ed4245; // Red
  }

  &.offline {
    background-color: #747f8d; // Gray
    position: relative;

    &:after {
      content: "";
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: var(--color-bg-main);
      border-radius: 50%;
      top: 2px;
      left: 2px;
    }
  }
}
</style>
