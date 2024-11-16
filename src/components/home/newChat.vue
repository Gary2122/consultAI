<style lang="scss" scoped>
.newChatDialog {
  :deep(.el-dialog) {
    border-radius: 10px;
    padding: 20px;
    .el-dialog__footer {
      padding-top: 12px;
    }
    .el-input__wrapper {
      height: 42px;
    }
    .chatContainer {
      .fade-enter-active,
      .fade-leave-active {
        transition: opacity 0.8s;
      }
      .fade-enter,
      .fade-leave-to {
        opacity: 0;
      }
    }
  }
}
</style>
<template>
  <div>
    <div
      class="addChat bg-blueGray br-8 h-44px flex-cc cursor-pointer"
      @click="centerDialogVisible = true"
    >
      <i>icon</i>
      <div>创建新聊天</div>
    </div>

    <chat-dialog
      :title="'创建新项目'"
      :dialogVis="centerDialogVisible"
      @editDialogVis="chatDialogVis"
      @chatDialogEvent="foundNewChat"
    ></chat-dialog>
  </div>
</template>

<script lang="ts" setup>
const Emits = defineEmits(["foundChat"]);
const newChatName = ref("");
const centerDialogVisible = ref(false);
const chatWarning = ref(false);
const chatDialogVis = (value: boolean) => {
  centerDialogVisible.value = value;
};
const foundNewChat = (value: any) => {
  Emits("foundChat", value);
};
watch(newChatName, (n) => {
  if (n.length !== 0) chatWarning.value = false;
});
</script>
