<style lang="scss" scoped>
.TSide {
  .addChat {
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
<style scoped></style>
<template>
  <div class="TSide w-248 h-full br-16">
    <div class="bg-blue p-12 br-12 mt-12">
      <newChat></newChat>
    </div>
    <div class="bg-blue pt-12 pl-12 pr-4 pb-12 mt-16 br-12">
      <el-scrollbar style="height: calc(100vh - 197px)">
        <div class="pr-8" v-for="item in chatList">
          <SideItem :title="item.title" />
        </div>
      </el-scrollbar>
    </div>
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
