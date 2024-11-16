<style lang="scss" scoped>
.sideItem {
  &:hover {
    opacity: 0.9;
  }
}
</style>

<template>
  <div class="sideItem h-44 br-8 cursor-pointer flex-cc bg-cPrimaryL2 mb-12">
    <div class="itemTitle">{{ Props.title }}</div>
    <i class="">icon-edit</i>
  </div>
</template>

<script lang="ts" setup>
const Props = defineProps({
  title: {
    type: String,
    default: "title",
  },
});
</script>
