<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-08 14:04:48
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-08 15:19:37
-->
<template>
  <div class="search-box">
    <el-input
      v-model="searchText"
      :placeholder="`搜索${props.searchType === 1 ? '好友' : '群组'}`"
      prefix-icon="el-icon-search"
      clearable
      @input="changeSearchText"
    />
  </div>
</template>

<script lang="ts" setup>
import { defineModel } from "vue";
const searchText = defineModel();
const props = defineProps({
  searchType: {
    type: Number,
    default: 1,
  },
});
</script>

<style scoped lang="scss">
.search-box {
  padding: 16px 10px;

  :deep(.el-input__inner) {
    background-color: #202225;
    border: none;
    color: #dcddde;
    border-radius: 4px;

    &::placeholder {
      color: #72767d;
    }
  }

  :deep(.el-input__prefix) {
    color: #72767d;
  }
}
</style>
