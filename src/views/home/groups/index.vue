<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-27 13:28:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-04-27 13:45:23
-->
<template>
  <div class="groups-container">
    <!-- 左侧好友/群组列表 -->
    <div class="groups-left">
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索"
          prefix-icon="el-icon-search"
          clearable
        />
      </div>
      <!-- 群组列表 -->
      <div class="list-container">
        <div
          v-for="group in groups"
          :key="group.id"
          :class="['list-item', selectedId === group.id ? 'active' : '']"
          @click="handleSelect(group.id)"
        >
          <el-avatar :size="40" :src="group.avatar" shape="square" />
          <div class="item-info">
            <div class="item-name">{{ group.name }}</div>
            <div class="item-status">{{ group.memberCount }}人</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧聊天内容区 -->
    <div class="groups-right">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const searchText = ref("");
const selectedId = ref(1);

const groups = ref([
  {
    id: 101,
    name: "心理健康交流群",
    memberCount: 128,
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
  {
    id: 102,
    name: "情绪管理学习小组",
    memberCount: 36,
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
  {
    id: 103,
    name: "职场减压互助会",
    memberCount: 67,
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  },
]);


// 选择好友或群组
const handleSelect = (id: number) => {
  selectedId.value = id;
  // 导航到对应的聊天页面
  const path =`/group/chat?type=group&id=${id}`;
  router.push(path);
};
</script>

<style lang="scss" scoped>
.groups-container {
  display: flex;
  overflow: hidden;
  height: 100%;
}

.groups-left {
  width: 250px;
  background-color: #2f3136;
  color: #dcddde;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #202225;
  overflow: hidden;

  .tabs-container {
    display: flex;
    border-bottom: 1px solid #202225;

    .tab {
      flex: 1;
      text-align: center;
      padding: 16px 0;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background-color: rgba(79, 84, 92, 0.16);
      }

      &.active {
        border-bottom: 2px solid #5865f2;
        color: white;
      }
    }
  }

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

  .list-container {
    flex: 1;
    overflow-y: auto;

    .list-header {
      padding: 12px 10px 6px;
      color: #72767d;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .list-item {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      margin: 0 6px;

      &:hover {
        background-color: rgba(79, 84, 92, 0.16);
      }

      &.active {
        background-color: rgba(79, 84, 92, 0.32);
      }

      .item-info {
        margin-left: 10px;
        flex: 1;
        min-width: 0;

        .item-name {
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-status {
          font-size: 12px;
          color: #b9bbbe;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-left: 5px;

        &.online {
          background-color: #3ba55d;
        }

        &.offline {
          background-color: #747f8d;
        }
      }
    }
  }
}

.groups-right {
  flex: 1;
  background-color: #36393f;
  display: flex;
  flex-direction: column;
}
</style>
