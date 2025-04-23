<style lang="scss">
.layout-header {
  width: 100%;
  background-color: var(--header-bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  
  .userInfo {
    color: var(--text-color);
  }
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
      <modelSelectBtn/>
      <!-- <div class="flex-cc">
        <nav>功能1</nav>
        <nav>功能2</nav>
        <nav>功能3</nav>
      </div> -->
      <div class="ml-20 mr-15">头像</div>
    </div>
  </header>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { Vue3Lottie } from "vue3-lottie";
import headAnimation from "@/assets/animation/Iconists-Central-Cat.json";
import { getUserSetting } from "@/utils/user";
import modelSelectBtn from "../header/modelSelectBtn.vue";
const modelValue = ref("black");

const initUserSetting = async () => {
  const { theme } = await getUserSetting();
  console.log("theme", theme);
  modelValue.value = theme;
};
onMounted(() => {
  initUserSetting();
});
</script>
