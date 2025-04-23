<style lang="scss" scoped>
.home {
  height: 100vh;
  min-width: 1240px;
  background: url("@/assets/img/home/bg-page.png") no-repeat center/cover;
  // overflow: hidden;
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
    padding: 20px 20px 10px 20px;
    gap: 10px;
    .chatBox {
      width: calc(100% - 500px - 248px);
      background-color: aqua;
      height: calc(100vh - 98px);
      border-radius: 16px;
    }
    .AIChatBox {
      width: 500px;
      height: calc(100vh - 98px);
      border-radius: 16px;
      background-color: aliceblue;
    }
  }
}
</style>
<template>
  <div class="home">
    <THeader class="header h-68"></THeader>
    <div class="content flex-ss">
      <TSide></TSide>
      <div class="chatBox">
        <router-view></router-view>
      </div>
      <div class="AIChatBox">
        <AIChat></AIChat>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import THeader from "@/components/layout/THeader.vue";
import TSide from "@/components/layout/TSide.vue";
import AIChat from "@/components/layout/AIChat.vue";
</script>
