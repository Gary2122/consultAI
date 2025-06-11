<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-06 11:01:27
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-08 13:59:20
-->
<template>
  <div class="friend-item">
    <div class="avatar-container">
      <el-avatar :size="40" :src="friend.avatar" class="avatar"></el-avatar>
      <StatusIndicator
        :status="friend.status"
        size="medium"
        class="status-indicator"
      />
    </div>
    <div class="friend-info">
      <div class="friend-name">{{ friend.username }}</div>
      <div class="friend-status">{{ statusText }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import StatusIndicator from "./StatusIndicator.vue";

const props = defineProps({
  friend: {
    type: Object,
    required: true,
  },
});

// 状态文本
const statusText = computed(() => {
  const statusMap = {
    online: "在线",
    away: "离开",
    busy: "勿扰",
    offline: "离线",
  };
  return statusMap[props.friend.status] || "离线";
});
</script>

<style lang="scss" scoped>
.friend-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: var(--color-list-item-bg);
  border-radius: 6px;
  &:hover {
    background-color: rgba(79, 84, 92, 0.16);
  }

  .avatar-container {
    position: relative;
    margin-right: 12px;

    .avatar {
      background-color: #99aab5;
    }

    .status-indicator {
      position: absolute;
      bottom: 0;
      right: 0;
      border: 2px solid var(--color-bg-main);
    }
  }

  .friend-info {
    flex: 1;
    min-width: 0;

    .friend-name {
      font-weight: 500;
      color: #fff;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .friend-status {
      font-size: 12px;
      color: #b9bbbe;
    }
  }
}
</style>
