<style lang="scss">
.layout-header {
  width: 100%;
}
</style>
<template>
  <header class="layout-header flex-bc">
    <div class="pl-20 flex-cc">
      <Vue3Lottie
        :animationData="headAnimation"
        :width="60"
        :height="30"
      ></Vue3Lottie>
      Garrison AI
    </div>
    <div class="userInfo flex-cc pr-20">
      <div class="flex-cc">
        <nav>功能1</nav>
        <nav>功能2</nav>
        <nav>功能3</nav>
      </div>
      <div>头像</div>
    </div>
  </header>
</template>
<script lang="ts" setup>
import { Vue3Lottie } from "vue3-lottie";
import headAnimation from "@/assets/animation/Iconists-Central-Cat.json";
</script>
