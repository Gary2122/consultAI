<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-06 11:01:27
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-08 13:59:20
-->
<template>
  <div class="list-item">
    <el-avatar :size="40" :src="props.friend.avatar" />
    <div class="item-info">
      <div class="item-name">{{ props.friend.username }}</div>
      <div class="item-status">
        {{ props.friend.online ? "在线" : "离线/隐藏" }}
      </div>
    </div>
    <div
      class="status-dot"
      :class="props.friend.online ? 'online' : 'offline'"
    ></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  friend: {
    type: Object,
    default: () => ({
      id: 0,
      name: "",
      avatar: "",
      status: "",
      online: false,
    }),
  },
});
</script>

<style scoped lang="scss">
.list-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin: 0 6px;

  &:hover {
    background-color: rgba(79, 84, 92, 0.16);
  }

  &.active {
    background-color: rgba(79, 84, 92, 0.32);
  }
  .item-info {
    margin-left: 10px;
    flex: 1;
    min-width: 0;

    .item-name {
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-status {
      font-size: 12px;
      color: #b9bbbe;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 5px;

    &.online {
      background-color: #3ba55d;
    }

    &.offline {
      background-color: #747f8d;
    }
  }
}
</style>
