<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-27 13:28:10
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-20 17:02:59
-->
<template>
  <div class="groups-container">
    <!-- 左侧群组列表 -->
    <div class="groups-left">
      <!-- 搜索框 -->
      <searchInput v-model="searchText" :searchType="2"></searchInput>

      <!-- 我的群组列表 -->
      <div class="list-container">
        <div class="list-header">我的群组</div>
        <div v-if="loading" class="loading-container">
          <el-spinner>加载中...</el-spinner>
        </div>
        <div v-else-if="myGroups.length === 0" class="empty-container">
          暂无群组，请创建或加入群组
        </div>
        <div
          v-else
          v-for="group in filteredMyGroups"
          :key="group._id"
          :class="['list-item', currentGroupId === group._id ? 'active' : '']"
          @click="handleSelect(group._id)"
        >
          <el-avatar :size="40" :src="group.avatar" shape="square" />
          <div class="item-info">
            <div class="item-name">{{ group.name }}</div>
            <div class="item-status">{{ group.members?.length || 0 }}人</div>
          </div>
        </div>
      </div>

      <!-- 公开群组列表 -->
      <div class="list-container">
        <div class="list-header">公开群组</div>
        <div v-if="loadingPublic" class="loading-container">
          <el-spinner>加载中...</el-spinner>
        </div>
        <div v-else-if="publicGroups.length === 0" class="empty-container">
          暂无公开群组
        </div>
        <div
          v-else
          v-for="group in filteredPublicGroups"
          :key="group._id"
          class="list-item"
        >
          <el-avatar :size="40" :src="group.avatar" shape="square" />
          <div class="item-info">
            <div class="item-name">{{ group.name }}</div>
            <div class="item-status">{{ group.members?.length || 0 }}人</div>
          </div>
          <el-button
            v-if="!group.isJoined"
            type="primary"
            size="small"
            @click.stop="handleJoinGroup(group._id)"
          >
            加入
          </el-button>
          <el-button
            v-else
            type="success"
            size="small"
            @click.stop="handleSelect(group._id)"
          >
            进入
          </el-button>
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
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useGroupStore } from "@/stores/group";
import { ElMessage } from "element-plus";
import searchInput from "@/components/home/input/searchInput.vue";
import { getPublicGroupsApi, joinPublicGroupApi } from "@/api/group";

interface GroupMember {
  user: {
    _id: string;
    username: string;
    avatar: string;
  };
  role: string;
  joinedAt: string;
}

interface Group {
  _id: string;
  name: string;
  description: string;
  avatar: string;
  creator: {
    _id: string;
    username: string;
    avatar: string;
  };
  members: GroupMember[];
  isPrivate: boolean;
  isJoined?: boolean;
}

const router = useRouter();
const groupStore = useGroupStore();
const searchText = ref("");
const loading = ref(false);
const loadingPublic = ref(false);
const publicGroups = ref<Group[]>([]);

// 计算过滤后的我的群组列表
const filteredMyGroups = computed(() => {
  if (!searchText.value) return groupStore.allGroups;

  return groupStore.allGroups.filter((group) =>
    group.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 计算过滤后的公开群组列表
const filteredPublicGroups = computed(() => {
  if (!searchText.value) return publicGroups.value;

  return publicGroups.value.filter((group) =>
    group.name.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

// 获取当前选中的群组ID
const currentGroupId = computed(() => groupStore.currentGroupId);

// 获取我的群组列表
const myGroups = computed(() => groupStore.allGroups);

// 加载我的群组列表
const loadGroups = async () => {
  loading.value = true;
  try {
    await groupStore.loadUserGroups();
  } catch (error) {
    console.error("加载群组失败:", error);
    ElMessage.error("加载群组失败，请刷新页面重试");
  } finally {
    loading.value = false;
  }
};

// 加载公开群组列表
const loadPublicGroups = async () => {
  loadingPublic.value = true;
  try {
    const response = await getPublicGroupsApi();
    publicGroups.value = response;
  } catch (error) {
    console.error("加载公开群组失败:", error);
    ElMessage.error("加载公开群组失败，请刷新页面重试");
  } finally {
    loadingPublic.value = false;
  }
};

// 选择群组
const handleSelect = (groupId: string) => {
  groupStore.setCurrentGroup(groupId);
  router.push(`/group/${groupId}`);
};

// 加入群组
const handleJoinGroup = async (groupId: string) => {
  try {
    await joinPublicGroupApi(groupId);
    ElMessage.success("成功加入群组");
    // 重新加载群组列表
    await loadGroups();
    await loadPublicGroups();
    // 自动进入群组
    handleSelect(groupId);
  } catch (error: any) {
    console.error("加入群组失败:", error);
    ElMessage.error(error.response?.data?.message || "加入群组失败，请重试");
  }
};

// 组件挂载时加载群组列表
onMounted(() => {
  loadGroups();
  loadPublicGroups();
});
</script>

<style lang="scss" scoped>
.groups-container {
  display: flex;
  overflow: hidden;
  height: 100%;
}

.groups-left {
  width: 250px;
  background-color: var(--color-bg-main);
  color: var(--color-text-normal);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border-main);
  overflow: hidden;

  .create-group {
    padding: 10px;
    display: flex;
    justify-content: center;
    border-bottom: 1px solid var(--color-border-main);
  }

  .search-box {
    padding: 16px 10px;

    :deep(.el-input__inner) {
      background-color: var(--color-bg-main);
      border: none;
      color: var(--color-text-normal);
      border-radius: 4px;

      &::placeholder {
        color: var(--color-text-muted);
      }
    }

    :deep(.el-input__prefix) {
      color: var(--color-text-muted);
    }
  }

  .list-container {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 10px;

    .list-header {
      padding: 12px 10px 6px;
      color: #72767d;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .loading-container,
    .empty-container {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #72767d;
      height: 100px;
      font-size: 13px;
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

      .el-button {
        margin-left: 8px;
      }
    }
  }
}

.groups-right {
  flex: 1;
  background-color: var(--color-bg-main);
  display: flex;
  flex-direction: column;
}
</style>
