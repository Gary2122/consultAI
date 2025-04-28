<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-27 13:28:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-04-27 13:45:23
-->
<template>
  <div class="friends-container">
    <!-- 左侧好友/群组列表 -->
    <div class="friends-left">
      <!-- 顶部标签切换 -->
      <div class="tabs-container">
        <div
          :class="['tab', activeTab === 'friends' ? 'active' : '']"
          @click="activeTab = 'friends'"
        >
          好友
        </div>
        <div
          :class="['tab', activeTab === 'groups' ? 'active' : '']"
          @click="activeTab = 'groups'"
        >
          群组
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchText"
          placeholder="搜索"
          prefix-icon="el-icon-search"
          clearable
        />
      </div>

      <!-- 好友列表 -->
      <div v-if="activeTab === 'friends'" class="list-container">
        <div class="list-header">
          <span>在线好友 - {{ getOnlineFriends.length }}</span>
        </div>
        <div
          v-for="friend in getOnlineFriends"
          :key="friend.id"
          :class="['list-item', selectedId === friend.id ? 'active' : '']"
          @click="handleSelect(friend.id)"
        >
          <el-avatar :size="40" :src="friend.avatar" />
          <div class="item-info">
            <div class="item-name">{{ friend.name }}</div>
            <div class="item-status">{{ friend.status }}</div>
          </div>
          <div class="status-dot online"></div>
        </div>

        <div class="list-header">
          <span>离线好友 - {{ getOfflineFriends.length }}</span>
        </div>
        <div
          v-for="friend in getOfflineFriends"
          :key="friend.id"
          :class="['list-item', selectedId === friend.id ? 'active' : '']"
          @click="handleSelect(friend.id)"
        >
          <el-avatar :size="40" :src="friend.avatar" />
          <div class="item-info">
            <div class="item-name">{{ friend.name }}</div>
            <div class="item-status">离线</div>
          </div>
          <div class="status-dot offline"></div>
        </div>
      </div>

      <!-- 群组列表 -->
      <div v-else class="list-container">
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
    <div class="friends-right">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const activeTab = ref("friends");
const searchText = ref("");
const selectedId = ref(1);

// 模拟数据
const friends = ref([
  {
    id: 1,
    name: "Alice Cooper",
    status: "在线",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: true,
  },
  {
    id: 2,
    name: "Bob Johnson",
    status: "请勿打扰",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: true,
  },
  {
    id: 3,
    name: "Carol Smith",
    status: "离开",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: true,
  },
  {
    id: 4,
    name: "David Black",
    status: "离线",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: false,
  },
  {
    id: 5,
    name: "Eve White",
    status: "离线",
    avatar:
      "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
    online: false,
  },
]);

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

// 根据在线状态过滤好友
const getOnlineFriends = computed(() => {
  return friends.value.filter(
    (friend) =>
      friend.online &&
      friend.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const getOfflineFriends = computed(() => {
  return friends.value.filter(
    (friend) =>
      !friend.online &&
      friend.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 选择好友或群组
const handleSelect = (id: number) => {
  selectedId.value = id;
  // 导航到对应的聊天页面
  const path =
    activeTab.value === "friends"
      ? `/home/chat?type=friend&id=${id}`
      : `/home/chat?type=group&id=${id}`;
  router.push(path);
};
</script>

<style lang="scss" scoped>
.friends-container {
  display: flex;
  overflow: hidden;
  height: 100%;
}

.friends-left {
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

.friends-right {
  flex: 1;
  background-color: #36393f;
  display: flex;
  flex-direction: column;
}
</style>
