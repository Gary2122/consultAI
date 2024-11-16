<style lang="scss" scoped></style>
<template>
  <div>
    <div
      class="addChat bg-blueGray br-8 h-44px flex-cc cursor-pointer"
      @click="centerDialogVisible = true"
    >
      <!-- <el-button type="primary" style="color: black">点击一下</el-button> -->
      <i>icon</i>
      <!-- <el-button ></el-button> -->
      <div>创建新聊天</div>
    </div>
    <el-dialog
      v-model="centerDialogVisible"
      title="Warning"
      width="500"
      align-center
    >
      <span>Open the dialog from the center from the screen</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="centerDialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="centerDialogVisible = false">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const centerDialogVisible = ref(false);
</script>
