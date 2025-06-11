<!--
 * @Descripttion: 用户个人信息展示页面
 * @version: 
 * @Author: Garrison
 * @Date: 2025-05-06 11:27:30
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-06-11 17:25:46
-->
<template>
  <div class="user-info-container">
    <!-- 头部横幅 -->
    <div class="user-banner">
      <div class="banner-overlay"></div>
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
            <el-button type="primary" size="small" @click="sendMessage"
              ><svg class="iconSize iconColor" aria-hidden="true">
                <use xlink:href="#icon-tuichu"></use></svg
              >发送消息</el-button
            >
            <el-button type="default" plain size="small" @click="goToSettings"
              ><svg class="iconSize" aria-hidden="true">
                <use xlink:href="#icon-zhongmingming"></use></svg
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
              MBTI性格类型
            </h3>
            <div class="info-content">
              <div v-if="userInfo.assessments" class="mbti-display">
                <el-tag size="large" type="primary" effect="dark">
                  {{ userInfo.assessments }}
                </el-tag>
                <div class="mbti-description">
                  {{
                    mbtiTypes.find((t) => t.value === userInfo.assessments)
                      ?.description
                  }}
                </div>
              </div>
              <div class="empty-info" v-else>
                <i class="el-icon-collection-tag"></i>
                <span>暂无MBTI性格类型</span>
                <el-button
                  type="text"
                  class="take-test-btn"
                  @click="openEditDialog"
                  >去测试</el-button
                >
              </div>
            </div>
          </div>

          <!-- 性格标签 -->
          <div class="info-section">
            <h3 class="section-title">
              <i class="el-icon-data-line"></i>
              性格标签
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
                <i class="el-icon-data-line"></i>
                <span>暂无性格标签</span>
                <el-button
                  type="text"
                  class="take-test-btn"
                  @click="openEditDialog"
                  >去添加</el-button
                >
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

    <!-- 编辑MBTI和标签的对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑性格标签" width="500px">
      <div class="edit-dialog-content">
        <div class="mbti-section">
          <h4>MBTI性格类型</h4>
          <el-select v-model="editingMBTI" placeholder="选择你的MBTI类型">
            <el-option
              v-for="type in mbtiTypes"
              :key="type.value"
              :label="`${type.value} - ${type.label}`"
              :value="type.value"
            >
              <span>{{ type.value }} - {{ type.label }}</span>
              <span class="mbti-description">{{ type.description }}</span>
            </el-option>
          </el-select>
        </div>

        <div class="tags-section">
          <h4>性格标签</h4>
          <el-select
            v-model="editingTags"
            multiple
            collapse-tags
            placeholder="选择性格标签"
          >
            <el-option
              v-for="tag in personalityTags"
              :key="tag.name"
              :label="tag.name"
              :value="tag.name"
            >
              <el-tag :type="tag.type">{{ tag.name }}</el-tag>
            </el-option>
          </el-select>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveMBTIAndTags">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import dayjs from "dayjs";
import { useUserStore } from "@/stores/user";
import { getUserProfile, updateUserProfile } from "@/api/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const loading = ref(false);

// MBTI类型定义
const mbtiTypes = [
  {
    value: "ISTJ",
    label: "检查者",
    description: "安静、严肃、通过全面性和可靠性获得成功",
  },
  { value: "ISFJ", label: "守护者", description: "安静、友善、有责任心和谨慎" },
  {
    value: "INFJ",
    label: "提倡者",
    description: "寻求意义和联系，想要了解什么能够激励别人",
  },
  {
    value: "INTJ",
    label: "建筑师",
    description: "在实现自己的想法和达成自己的目标时有创新的想法和非凡的动力",
  },
  {
    value: "ISTP",
    label: "鉴赏家",
    description:
      "灵活和宽容，安静地观察直到问题出现，然后迅速行动找到可行的解决方案",
  },
  { value: "ISFP", label: "探险家", description: "安静、友善、敏感和善良" },
  {
    value: "INFP",
    label: "调停者",
    description: "理想主义者，忠于自己的价值观和自己所重视的人",
  },
  {
    value: "INTP",
    label: "学者",
    description: "追求自己的兴趣，有逻辑性和创造力",
  },
  {
    value: "ESTP",
    label: "企业家",
    description: "灵活、宽容，采用实用的方法解决问题",
  },
  { value: "ESFP", label: "表演者", description: "外向、友善、接受性强" },
  { value: "ENFP", label: "竞选者", description: "热情洋溢、富有想象力" },
  {
    value: "ENTP",
    label: "辩论家",
    description: "反应快、睿智，能够应对各种挑战",
  },
  {
    value: "ESTJ",
    label: "总经理",
    description: "实际、现实主义者，具有企业或机械方面的天赋",
  },
  { value: "ESFJ", label: "执政官", description: "热心肠、有责任心、合作性强" },
  {
    value: "ENFJ",
    label: "主人公",
    description: "热情、为他人着想、反应敏捷、负责任",
  },
  { value: "ENTJ", label: "指挥官", description: "坦诚、果断，天生的领导者" },
];

// 性格标签定义
const personalityTags = [
  { name: "开朗", type: "success" },
  { name: "内向", type: "info" },
  { name: "乐观", type: "success" },
  { name: "谨慎", type: "warning" },
  { name: "幽默", type: "primary" },
  { name: "理性", type: "info" },
  { name: "感性", type: "danger" },
  { name: "独立", type: "primary" },
  { name: "合群", type: "success" },
  { name: "创新", type: "warning" },
  { name: "传统", type: "info" },
  { name: "冒险", type: "danger" },
];

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
  tags: [] as { name: string; type: string }[],
  assessments: "",
  stats: {
    friends: 0,
    groups: 0,
    posts: 0,
    consultations: 0,
  },
  activities: [],
  friends: [],
  isFriend: false,
});

// 编辑MBTI和标签的对话框
const showEditDialog = ref(false);
const editingMBTI = ref("");
const editingTags = ref<string[]>([]);

// 打开编辑对话框
const openEditDialog = () => {
  editingMBTI.value = userInfo.assessments;
  editingTags.value = userInfo.tags.map((tag) => tag.name);
  showEditDialog.value = true;
};

// 保存MBTI和标签
const saveMBTIAndTags = async () => {
  try {
    // 更新用户信息
    userInfo.assessments = editingMBTI.value;
    userInfo.tags = editingTags.value.map((tagName) => {
      const tag = personalityTags.find((t) => t.name === tagName);
      return {
        name: tagName,
        type: tag ? tag.type : "primary",
      };
    });

    // 调用API保存更新
    await updateUserProfile({
      assessments: userInfo.assessments,
      tags: userInfo.tags,
    });

    showEditDialog.value = false;
    ElMessage.success("更新成功");
  } catch (error) {
    console.error("保存失败:", error);
    ElMessage.error("保存失败");
  }
};

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
      userInfo.assessments = userData.assessments || "";
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
  router.push(`/home`);
  if (route.query.userId && userStore.loggedIn) {
  }
};

// 组件挂载时加载用户资料
onMounted(() => {
  loadUserProfile();
});
</script>

<style lang="scss" scoped>
.iconSize {
  width: 15px;
  margin-right: 8px;
}
.iconColor {
  fill: #ffffff;
}
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
    background-color: var(--color-card-header);
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

.mbti-display {
  text-align: center;
  padding: 10px 0;

  .el-tag {
    font-size: 18px;
    padding: 8px 16px;
    margin-bottom: 10px;
  }

  .mbti-description {
    color: var(--color-text-muted);
    font-size: 14px;
    line-height: 1.5;
    margin-top: 10px;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 0;

  .user-tag {
    margin-right: 0;
    font-size: 14px;
    padding: 6px 12px;
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

.edit-dialog-content {
  .mbti-section,
  .tags-section {
    margin-bottom: 20px;

    h4 {
      margin-bottom: 10px;
      color: var(--color-text-normal);
    }
  }

  .mbti-description {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-left: 10px;
  }
}

:deep(.el-select-dropdown__item) {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;

  .mbti-description {
    font-size: 12px;
    color: var(--color-text-muted);
    margin-top: 4px;
  }
}
</style>
