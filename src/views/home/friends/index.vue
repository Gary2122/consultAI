<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-27 13:28:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-09 16:58:36
-->
<template>
  <div class="friends-container">
    <!-- 左侧好友/群组列表 -->
    <div class="friends-left">
      <searchInput v-model="searchText" :searchType="1"></searchInput>
      <!-- 好友列表 -->
      <div class="list-container">
        <div class="list-header">
          <span>在线好友 - {{ getOnlineFriends.length }}</span>
        </div>
        <div
          v-for="friend in getOnlineFriends"
          :key="friend._id"
          :class="selectedId === friend._id ? 'active' : ''"
          @click="handleSelect(friend._id)"
        >
          <friendListItem :friend="friend"></friendListItem>
        </div>

        <div class="list-header">
          <span>离线好友 - {{ getOfflineFriends.length }}</span>
        </div>
        <div
          v-for="friend in getOfflineFriends"
          :key="friend._id"
          :class="selectedId === friend._id ? 'active' : ''"
          @click="handleSelect(friend._id)"
        >
          <friendListItem :friend="friend"></friendListItem>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { searchFriends, getFriends } from "@/actions/friends";
import searchInput from "@/components/home/input/searchInput.vue";
import friendListItem from "@/components/home/friends/friendListItem.vue";

const router = useRouter();
const activeTab = ref("friends");
const searchText = ref("");
const selectedId = ref(1);

// 模拟数据
const friends = ref<any[]>([]);

// 获取好友列表
const getFriendsList = async () => {
  const friendsList = await getFriends();
  friends.value = friendsList;
  console.log(friendsList);
};

// 搜索好友
// const searchFriendsList = async () => {
//   const searchResult = await searchFriends(searchText.value);
//   friends.value = searchResult;
//   console.log(searchResult);
// };

// 根据在线状态过滤好友
const getOnlineFriends = computed(() => {
  return friends.value.filter((friend) => {
    if (
      friend.status === "online" &&
      friend.username.toLowerCase().includes(searchText.value.toLowerCase())
    ) {
      return {
        ...friend,
        online: true,
      };
    }
  });
});

const getOfflineFriends = computed(() => {
  return friends.value.filter((friend) => {
    if (
      friend.status === "offline" &&
      friend.username.toLowerCase().includes(searchText.value.toLowerCase())
    ) {
      return {
        ...friend,
        online: false,
      };
    }
  });
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

onMounted(() => {
  getFriendsList();
});
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
  }
}

.friends-right {
  flex: 1;
  background-color: #36393f;
  display: flex;
  flex-direction: column;
}
</style>
