<template>
  <div class="containerHeaderBtn br-12 flex-cc rel cursor">
    <div class="headerBtnItem text-center flex-cc" :class="{ headerBtnCur: curHeaderTab == 1, textWhite: curHeaderTab == 1}" @click="changeCurHeaderTab(1)">匿名模式</div>
    <div class="headerBtnScroll br-8" :style="{ left: curHeaderTab == 2 ? 'calc(50% + 8px)' : '8px' }"></div>
    <div class="headerBtnItem text-center flex-cc" :class="{ headerBtnCur: curHeaderTab == 2}" @click="changeCurHeaderTab(2)">正常模式</div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { setUserSetting, getUserSetting } from '@/utils/user';
const curHeaderTab = ref(1);
const changeCurHeaderTab = async (tab: number) => {
  const newTheme = tab === 1 ? 'dark' : 'light';
  await setUserSetting({ theme: newTheme });
  const { theme } = await getUserSetting();
  curHeaderTab.value = theme === 'dark' ? 1 : 2;
  document.documentElement.setAttribute('theme', theme);
}
</script>
<style scoped>
.containerHeaderBtn {
  width: 218px;
  height: 48px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  position: relative;
  transition: all 0.3s;
  
  .headerBtnItem {
    color: var(--text-color);
    height: 100%;
    width: 50%;
    z-index: 2;
    cursor: pointer;
    transition: color 0.3s;
  }
  
  .headerBtnScroll {
    position: absolute;
    z-index: 1;
    height: 32px;
    width: 94px;
    background-color: var(--primary-color);
    transition: all 0.3s;
    left: 8px;
  }
  
  .headerBtnCur {
    font-weight: 600;
    color: var(--text-color);
  }
  
  .textWhite {
    color: var(--text-color);
  }
}
</style>
