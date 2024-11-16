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
  <div class="newChatDialog">
    <el-dialog
      v-model="Props.dialogVis"
      :title="Props.title"
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
                $emit('editDialogVis', false), (chatWarning = false);
              }
            "
            >取消</el-button
          >
          <el-button type="primary" @click="foundNewChat"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
const Props = defineProps({
  dialogVis: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "编辑项目名",
  },
});
const Emits = defineEmits(["chatDialogEvent", "editDialogVis"]);
const newChatName = ref("");
const chatWarning = ref(false);

const foundNewChat = () => {
  if (newChatName.value.length === 0) {
    chatWarning.value = true;
    return;
  }
  Emits("chatDialogEvent", newChatName.value);
  Emits("editDialogVis", false);
  newChatName.value = "";
};
watch(newChatName, (n) => {
  if (n.length !== 0) chatWarning.value = false;
});
</script>
