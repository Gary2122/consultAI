<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-13 20:44:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-06 10:21:44
-->
<style lang="scss" scoped>
.home {
  height: 100vh;
  min-width: 1240px;
  background: url("@/assets/img/home/bg-page.png") no-repeat center/cover;
  .header {
    backdrop-filter: blur(4px);
    position: sticky;
    top: 0;
    // background-image: radial-gradient(transparent 1px, rgb(227, 227, 227) 1px);
    background-color: --header-bg-color;
    background-size: 3px 3px;
  }
  .content {
    height: calc(100vh - 98px);
    padding: 5px 20px 10px 20px;
    .chatBox {
      width: calc(100% - 670px);
      height: calc(100vh - 98px);
      border-bottom-right-radius: 16px;
      border-top-right-radius: 16px;
      overflow: auto;
    }
    .AIChatBox {
      width: 650px;
      height: calc(100vh - 98px);
      border-radius: 16px;
      overflow: hidden;
      background-color: rgb(255, 255, 255);
      // padding: 20px;
      margin-left: 20px;
    }

    // 论坛页面专用样式
    .forum-view {
      padding: 0;

      .forum-container {
        border-radius: 0;
        height: 100%;
        padding-bottom: 70px;
      }
    }
  }
}
</style>
<template>
  <div class="home">
    <THeader class="header h-68"></THeader>
    <div class="content flex-ss">
      <TSide></TSide>
      <div class="chatBox" :class="{ 'forum-view': currentRoute === 'Forum' }">
        <router-view></router-view>
      </div>
      <div class="AIChatBox">
        <AIChat></AIChat>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import THeader from "../../components/layout/THeader.vue";
import TSide from "../../components/layout/TSide.vue";
import AIChat from "../AIChat/index.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const currentRoute = computed(() => route.name);
</script>
