<style lang="scss" scoped>
.sideItem {
  &:hover .itemTitle {
    color: rgb(61, 65, 71);
  }
  .edit {
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>

<template>
  <div
    class="sideItem h-44 br-8 cursor-pointer flex-bc bg-cPrimaryL2 mb-12 pl-16 pr-16"
  >
    <div class="itemTitle">{{ Props.title }}</div>
    <div
      class="edit fs-22 p-4 bg-cTextL3 flex-cc br-4"
      @click="centerDialogVis = true"
    >
      <i class="iconfont icon-bianji"></i>
    </div>
  </div>
  <ChatDialog
    :title="'编辑项目名称'"
    :dialog-vis="centerDialogVis"
    @edit-dialog-vis="chatDilaogVis"
    @chat-dialog-event="editCurItem"
  ></ChatDialog>
</template>

<script lang="ts" setup>
const Props = defineProps({
  title: {
    type: String,
    default: "title",
  },
  index: {
    type: Number,
    default: 0,
  },
});
const Emits = defineEmits(["editItemName"]);
const centerDialogVis = ref(false);
const chatDilaogVis = (value: boolean) => {
  centerDialogVis.value = value;
};
const editCurItem = (value: any) => {
  Emits("editItemName", { index: Props.index, value: value });
};
</script>
