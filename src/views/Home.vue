<style lang="scss" scoped>
.home {
  height: 100vh;
  min-width: 1440px;
  background: url("@/assets/img/home/bg-page.png") no-repeat center/cover;
  // overflow: hidden;
  .header {
    backdrop-filter: blur(4px);
    position: sticky;
    top: 0;
    background-image: radial-gradient(transparent 1px, rgb(231, 231, 231) 1px);
    background-size: 3px 3px;
  }
  .content {
    height: calc(100vh - 68px);
    padding: 0 20px 0 20px;
  }
}
</style>
<template>
  <div class="home">
    <THeader class="header h-68"></THeader>
    <div class="content flex-ss">
      <TSide></TSide>
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import THeader from "@/components/layout/THeader.vue";
import TSide from "@/components/layout/TSide.vue";
</script>
