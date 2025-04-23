<style lang="scss" scoped>
.TSide {
  height: calc(100vh - 98px);
  // background-color: var(--bg-color);
  background-color: rgb(244, 183, 255);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  .bg-blue {
    background-color: var(--primary-color);
    transition: background-color 0.3s;
  }
  .setting {
    bottom: 100px;
  }
}
</style>
<template>
  <div class="TSide w-168 text-center position-relative pr-20">
    <div class="flex-cc mt-20 mb-20"><img src="@/assets/img/home/avartal.jpg" width="45" alt=""></div>
    <!-- 聊天导航部分 -->
    <div class="">
      <div>好友聊天</div>
      <div>群组聊天</div>
      <div>匿名空间</div>
    </div>
    <div class="">系统设置</div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import SideItem from "../home/sideItem.vue";
import newChat from "../home/newChat.vue";

const chatList = ref([
  {
    title: "项目1",
  },
  {
    title: "项目2",
  },
  {
    title: "项目3",
  },

  {
    title: "项目4",
  },
  {
    title: "项目5",
  },
  {
    title: "项目6",
  },
]);
// const addNewChat = () => {};
</script>
