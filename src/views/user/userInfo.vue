<!--
 * @Descripttion: 用户个人信息展示页面
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-06 11:27:30
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-16 15:23:27
-->
<template>
  <div class="user-info-container">
    <!-- 头部横幅 -->
    <div class="user-banner">
      <div class="banner-overlay"></div>
      <div class="edit-banner">
        <el-tooltip content="更换个性横幅" placement="top">
          <i class="el-icon-camera"></i>
        </el-tooltip>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="user-content">
      <!-- 用户基本信息卡片 -->
      <div class="user-card">
        <div class="avatar-container">
          <el-avatar
            :size="120"
            :src="userInfo.avatar"
            class="user-avatar"
          ></el-avatar>
          <el-badge
            :value="userInfo.online ? '在线' : '离线'"
            :type="userInfo.online ? 'success' : 'info'"
            class="status-badge"
          ></el-badge>
        </div>
        <div class="user-basic-info">
          <h2 class="username">{{ userInfo.username }}</h2>
          <div class="user-id">ID: {{ userInfo.id }}</div>
          <div class="register-date">
            加入于 {{ formatDate(userInfo.registerDate) }}
          </div>
          <div class="user-buttons">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-chat-dot-round"
              @click="sendMessage"
              >发送消息</el-button
            >
            <el-button
              type="default"
              plain
              size="small"
              icon="el-icon-setting"
              @click="goToSettings"
              >编辑资料</el-button
            >
          </div>
        </div>
      </div>

      <!-- 用户详细信息 -->
      <div class="user-details">
        <!-- 左侧：个人资料、心理标签等 -->
        <div class="details-left">
          <!-- 个人资料 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-user"></i>
              个人资料
            </h3>
            <div class="info-content">
              <div class="info-item" v-if="userInfo.bio">
                <div class="info-label">个性签名</div>
                <div class="info-value bio">{{ userInfo.bio }}</div>
              </div>
              <div class="info-item" v-if="userInfo.gender">
                <div class="info-label">性别</div>
                <div class="info-value">
                  {{ genderMap[userInfo.gender as keyof typeof genderMap] }}
                </div>
              </div>
              <div class="info-item" v-if="userInfo.birthday">
                <div class="info-label">出生日期</div>
                <div class="info-value">
                  {{ formatDate(userInfo.birthday) }}
                </div>
              </div>
              <div class="info-item" v-if="userInfo.location">
                <div class="info-label">所在地</div>
                <div class="info-value">{{ userInfo.location }}</div>
              </div>

              <div class="empty-info" v-if="!hasProfileInfo">
                <i class="el-icon-document"></i>
                <span>暂无个人资料信息</span>
              </div>
            </div>
          </div>

          <!-- 心理标签 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-collection-tag"></i>
              心理标签
            </h3>
            <div class="info-content">
              <div
                class="tags-container"
                v-if="userInfo.tags && userInfo.tags.length > 0"
              >
                <el-tag
                  v-for="tag in userInfo.tags"
                  :key="tag.name"
                  :type="tag.type"
                  effect="dark"
                  class="user-tag"
                >
                  {{ tag.name }}
                </el-tag>
              </div>
              <div class="empty-info" v-else>
                <i class="el-icon-collection-tag"></i>
                <span>暂无心理标签</span>
              </div>
            </div>
          </div>

          <!-- 测评结果 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-data-line"></i>
              测评结果
            </h3>
            <div class="info-content">
              <div
                class="assessment-list"
                v-if="userInfo.assessments && userInfo.assessments.length > 0"
              >
                <div
                  v-for="(assessment, index) in userInfo.assessments"
                  :key="index"
                  class="assessment-item"
                >
                  <div class="assessment-header">
                    <span class="assessment-name">{{ assessment.name }}</span>
                    <span class="assessment-date">{{
                      formatDate(assessment.date)
                    }}</span>
                  </div>
                  <div class="assessment-result">
                    <el-progress
                      :percentage="assessment.score"
                      :color="getProgressColor(assessment.score)"
                      :stroke-width="10"
                      :show-text="false"
                    ></el-progress>
                    <span class="score-text">{{ assessment.score }}分</span>
                  </div>
                  <div class="assessment-desc">
                    {{ assessment.description }}
                  </div>
                </div>
              </div>
              <div class="empty-info" v-else>
                <i class="el-icon-data-line"></i>
                <span>暂无测评结果</span>
                <el-button type="text" class="take-test-btn">去测评</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：统计信息、活动记录等 -->
        <div class="details-right">
          <!-- 统计信息 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-data-analysis"></i>
              统计信息
            </h3>
            <div class="info-content">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ userInfo.stats.friends }}</div>
                  <div class="stat-label">好友</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ userInfo.stats.groups }}</div>
                  <div class="stat-label">群组</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-time"></i>
              最近活动
            </h3>
            <div class="info-content">
              <div
                class="activities-timeline"
                v-if="userInfo.activities && userInfo.activities.length > 0"
              >
                <div
                  v-for="(activity, index) in userInfo.activities"
                  :key="index"
                  class="activity-item"
                >
                  <div class="activity-icon">
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">
                      {{ formatTimeAgo(activity.time) }}
                    </div>
                    <div class="activity-desc" v-if="activity.description">
                      {{ activity.description }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-info" v-else>
                <i class="el-icon-time"></i>
                <span>暂无活动记录</span>
              </div>
            </div>
          </div>

          <!-- 好友列表预览 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-user"></i>
              好友 <span class="subtitle">(最近活跃)</span>
            </h3>
            <div class="info-content">
              <div
                class="friends-preview"
                v-if="userInfo.friends && userInfo.friends.length > 0"
              >
                <div
                  v-for="friend in userInfo.friends.slice(0, 6)"
                  :key="friend.id"
                  class="friend-item"
                >
                  <el-avatar :size="50" :src="friend.avatar"></el-avatar>
                  <div class="friend-name">{{ friend.name }}</div>
                  <div class="friend-status" :class="{ online: friend.online }">
                    <span class="status-dot"></span>
                    {{ friend.online ? "在线" : "离线" }}
                  </div>
                </div>
              </div>
              <div class="empty-info" v-else>
                <i class="el-icon-user"></i>
                <span>暂无好友</span>
              </div>
              <div
                class="view-more"
                v-if="userInfo.friends && userInfo.friends.length > 6"
              >
                <el-button type="text">查看更多好友</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";
import { useUserStore } from "@/stores/user";
import { getUserProfile } from "@/api/user";
import { ElMessage, ElLoading } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);

// 性别映射
const genderMap = {
  male: "男",
  female: "女",
  other: "其他",
};

// 用户信息数据 - 初始为空，后续填充
const userInfo = reactive({
  id: "",
  username: "",
  avatar: "",
  online: false,
  registerDate: "",
  bio: "",
  gender: "",
  birthday: "",
  location: "",
  tags: [],
  assessments: [],
  stats: {
    friends: 0,
    groups: 0,
    posts: 0,
    consultations: 0,
  },
  activities: [],
  friends: [],
  isFriend: false, // 如果查看的是他人
});

// 加载用户信息
const loadUserProfile = async () => {
  loading.value = true;

  // 从URL参数获取用户ID，如果没有则显示当前登录用户的信息
  const userId = route.query.userId?.toString();

  try {
    const response = await getUserProfile(userId);
    if (response && response.success) {
      // 填充用户信息
      const userData = response.data;
      userInfo.id = userData.id;
      userInfo.username = userData.username;
      userInfo.avatar = userData.avatar || "/src/assets/img/home/avartal.jpg";
      userInfo.online = userData.online;
      userInfo.registerDate = userData.registerDate;
      userInfo.bio = userData.bio;
      userInfo.gender = userData.gender;
      userInfo.birthday = userData.birthday;
      userInfo.location = userData.location;
      userInfo.tags = userData.tags || [];
      userInfo.assessments = userData.assessments || [];
      userInfo.stats = userData.stats || {
        friends: 0,
        groups: 0,
        posts: 0,
        consultations: 0,
      };
      userInfo.activities = userData.activities || [];

      // TODO: 将来可以添加加载好友列表的功能
      // 暂时使用示例数据
      userInfo.friends = [
        {
          id: 1,
          name: "Alice",
          avatar: "/src/assets/img/home/avartal.jpg",
          online: true,
        },
        {
          id: 2,
          name: "Bob",
          avatar: "/src/assets/img/home/avartal.jpg",
          online: false,
        },
        {
          id: 3,
          name: "Carol",
          avatar: "/src/assets/img/home/avartal.jpg",
          online: true,
        },
      ];

      // 如果是其他用户，显示是否已经是好友
      if (userId && userId !== userStore.userId) {
        userInfo.isFriend = userData.isFriend || false;
      }
    } else {
      ElMessage.error("获取用户信息失败");
    }
  } catch (error) {
    console.error("加载用户资料出错:", error);
    ElMessage.error("获取用户资料时发生错误");
  } finally {
    loading.value = false;
  }
};

// 检查是否有个人资料信息
const hasProfileInfo = computed(() => {
  return (
    userInfo.bio || userInfo.gender || userInfo.birthday || userInfo.location
  );
});

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
};

// 计算活动的时间差
const formatTimeAgo = (time: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(time).getTime()) / 1000); // 秒

  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return formatDate(time.toString());
};

// 获取活动图标
const getActivityIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    post: "el-icon-document",
    assessment: "el-icon-data-line",
    friend: "el-icon-user",
    group: "el-icon-user-solid",
    consultation: "el-icon-chat-dot-round",
    default: "el-icon-more",
  };

  return iconMap[type] || iconMap.default;
};

// 获取进度条颜色
const getProgressColor = (score: number): string => {
  if (score < 30) return "#F56C6C"; // 危险
  if (score < 50) return "#E6A23C"; // 警告
  if (score < 70) return "#409EFF"; // 一般
  return "#67C23A"; // 良好
};

// 跳转到设置页面
const goToSettings = () => {
  router.push("/settings");
};

// 发送消息
const sendMessage = () => {
  // 如果是查看他人的资料且用户已登录
  if (route.query.userId && userStore.loggedIn) {
    router.push(`/home/chat?userId=${route.query.userId}`);
  }
};

// 组件挂载时加载用户资料
onMounted(() => {
  loadUserProfile();
});
</script>

<style lang="scss" scoped>
.user-info-container {
  background-color: var(--color-bg-main);
  color: var(--color-text-normal);
  min-height: 100vh;
  overflow: auto;
}

.user-banner {
  height: 200px;
  background-image: linear-gradient(
    135deg,
    var(--color-primary-light),
    var(--color-primary)
  );
  background-size: cover;
  background-position: center;
  position: relative; // 为了让 overlay 覆盖在 banner 上

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .edit-banner {
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    i {
      color: white;
      font-size: 20px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.7);
    }
  }
}

.user-content {
  position: relative;
  padding: 0 40px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-card {
  display: flex;
  margin-top: -60px;
  position: relative;
  z-index: 1;

  .avatar-container {
    position: relative;

    .user-avatar {
      border: 6px solid var(--color-bg-main);
      background-color: var(--color-bg-main);
    }

    .status-badge {
      position: absolute;
      right: 5px;
      bottom: 5px;

      :deep(.el-badge__content) {
        border: 2px solid #36393f;
      }
    }
  }

  .user-basic-info {
    margin-left: 30px;
    padding-top: 70px;

    .username {
      color: white;
      font-size: 24px;
      margin: 0 0 5px;
    }

    .user-id {
      color: var(--color-text-muted);
      font-size: 14px;
      margin-bottom: 5px;
    }

    .register-date {
      color: #b9bbbe;
      font-size: 14px;
      margin-bottom: 15px;
    }

    .user-buttons {
      display: flex;
      gap: 10px;
    }
  }
}

.user-details {
  margin-top: 40px;
  display: flex;
  gap: 30px;

  .details-left {
    width: 60%;
  }

  .details-right {
    width: 40%;
  }
}

.info-section {
  background-color: var(--color-primary-light);
  border-radius: 5px;
  margin-bottom: 20px;
  overflow: hidden;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 0;
    padding: 15px;
    background-color: var(--color-bg-main);
    display: flex;
    align-items: center;

    i {
      margin-right: 8px;
    }

    .subtitle {
      font-size: 12px;
      color: var(--color-text-muted);
      font-weight: normal;
      margin-left: 5px;
    }
  }

  .info-content {
    padding: 15px;
  }

  .info-item {
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: var(--color-text-muted);
      font-size: 12px;
      margin-bottom: 5px;
    }

    .info-value {
      color: var(--color-text-normal);
      font-size: 14px;

      &.bio {
        line-height: 1.5;
      }
    }
  }

  .empty-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: var(--color-text-muted);

    i {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .take-test-btn {
      margin-top: 10px;
      color: #5865f2;
    }
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .user-tag {
    margin-right: 0;
  }
}

.assessment-item {
  background-color: var(--color-bg-main);
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  .assessment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .assessment-name {
      color: var(--color-text-normal);
      font-weight: 500;
    }

    .assessment-date {
      color: var(--color-text-muted);
      font-size: 12px;
    }
  }

  .assessment-result {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    :deep(.el-progress) {
      flex: 1;
      margin-right: 10px;
    }

    .score-text {
      font-weight: 500;
      color: var(--color-text-normal);
    }
  }

  .assessment-desc {
    color: var(--color-text-muted);
    font-size: 13px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;

  .stat-item {
    background-color: var(--color-bg-main);
    border-radius: 4px;
    padding: 15px;
    text-align: center;

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text-normal);
      margin-bottom: 5px;
    }

    .stat-label {
      color: var(--color-text-muted);
      font-size: 13px;
    }
  }
}

.activities-timeline {
  .activity-item {
    display: flex;
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      background-color: var(--color-primary-light);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      flex-shrink: 0;

      i {
        color: white;
        font-size: 18px;
      }
    }

    .activity-content {
      flex: 1;
      min-width: 0;

      .activity-title {
        color: white;
        font-weight: 500;
        margin-bottom: 5px;
      }

      .activity-time {
        color: #b9bbbe;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .activity-desc {
        color: #dcddde;
        font-size: 13px;
      }
    }
  }
}

.friends-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;

  .friend-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .friend-name {
      color: white;
      font-size: 14px;
      margin: 8px 0 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }

    .friend-status {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #72767d;
      font-size: 12px;

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #72767d;
        margin-right: 5px;
      }

      &.online {
        color: #3ba55d;

        .status-dot {
          background-color: #3ba55d;
        }
      }
    }
  }
}

.view-more {
  text-align: center;
  margin-top: 15px;

  :deep(.el-button) {
    color: #5865f2;
  }
}

:deep(.el-button--primary) {
  background-color: #5865f2;
  border-color: #5865f2;

  &:hover,
  &:focus {
    background-color: #4752c4;
    border-color: #4752c4;
  }
}
</style>
