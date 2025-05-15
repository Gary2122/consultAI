<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-08 22:04:20
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-15 12:55:20
-->
<template>
  <div class="notice-container">
    <!-- 左侧好友请求列表 -->
    <FriendRequestList />
    <!-- 右侧搜索区域 -->
    <FriendSearchPanel />
  </div>
</template>

<script lang="ts" setup>
import FriendRequestList from "@/components/home/friends/friendRequestList.vue";
import FriendSearchPanel from "@/components/home/friends/friendSearchPanel.vue";
</script>

<style scoped lang="scss">
.notice-container {
  display: flex;
  height: 100%;
  background-color: var(--color-bg-main);
  color: var(--color-text-normal);
}
</style>
