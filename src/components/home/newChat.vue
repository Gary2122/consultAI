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
    <div class="newChatDialog">
      <el-dialog
        v-model="centerDialogVisible"
        title="创建新聊天"
        width="500"
        align-center
        :show-close="false"
      >
        <template #footer>
          <div class="chatContainer">
            <el-input
              v-model="newChatName"
              maxlength="20"
              show-word-limit
              placeholder="请输入新项目名"
            />
            <!-- <transition name="fade"> -->
            <div
              v-show="chatWarning"
              class="c-cDanger fs-14 flex-sc ml-4 mt-4 transition-all"
            >
              还未输入聊天名
            </div>
            <!-- </transition> -->
          </div>

          <div class="dialog-footer mt-20">
            <el-button
              @click="
                {
                  (centerDialogVisible = false), (chatWarning = false);
                }
              "
              >取消</el-button
            >
            <el-button type="primary" @click="foundNewChat"> 确定 </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
const Emits = defineEmits(["foundChat"]);
const newChatName = ref("");
const centerDialogVisible = ref(false);
const chatWarning = ref(false);
const foundNewChat = () => {
  if (newChatName.value.length === 0) {
    chatWarning.value = true;
  }
  console.log(newChatName.value);

  Emits("foundChat", newChatName.value);
  newChatName.value = "";
  centerDialogVisible.value = false;
};
watch(newChatName, (n) => {
  if (n.length !== 0) chatWarning.value = false;
});
</script>
