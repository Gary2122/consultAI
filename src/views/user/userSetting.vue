<!--
 * @Descripttion: 用户设置页面
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-30 16:12:37
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-13 20:12:42
-->
<template>
  <div class="user-settings-container">
    <!-- 左侧导航 -->
    <div class="settings-sidebar">
      <h2 class="settings-title">用户设置</h2>
      <el-menu
        :default-active="activeMenu"
        class="settings-menu"
        @select="handleMenuSelect"
      >
        <el-menu-item index="profile">
          <i class="el-icon-user"></i>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="account">
          <i class="el-icon-lock"></i>
          <span>账户安全</span>
        </el-menu-item>
        <el-menu-item index="privacy">
          <i class="el-icon-view"></i>
          <span>隐私设置</span>
        </el-menu-item>
        <el-menu-item index="notification">
          <i class="el-icon-bell"></i>
          <span>通知设置</span>
        </el-menu-item>
        <el-menu-item index="appearance">
          <i class="el-icon-brush"></i>
          <span>外观设置</span>
        </el-menu-item>
        <el-menu-item index="language">
          <i class="el-icon-document"></i>
          <span>语言与地区</span>
        </el-menu-item>
      </el-menu>

      <div class="account-info">
        <el-avatar
          :size="42"
          src="/src/assets/img/home/avartal.jpg"
        ></el-avatar>
        <div class="user-details">
          <div class="username">{{ userInfo.username }}</div>
          <div class="user-id">ID: {{ userInfo.id }}</div>
        </div>
        <el-button type="danger" size="small" plain @click="handleLogout"
          >退出登录</el-button
        >
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="settings-content">
      <!-- 个人资料设置 -->
      <div v-if="activeMenu === 'profile'" class="settings-section">
        <h3 class="section-title">个人资料</h3>
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar :size="100" :src="userInfo.avatar"></el-avatar>
            <div class="avatar-overlay">
              <i class="el-icon-edit"></i>
            </div>
          </div>
          <el-button type="primary" plain size="small">更换头像</el-button>
        </div>

        <el-form
          :model="userProfile"
          label-position="top"
          class="settings-form"
          v-loading="loading"
        >
          <el-form-item label="用户名">
            <el-input
              v-model="userProfile.username"
              placeholder="请输入用户名"
            ></el-input>
          </el-form-item>
          <el-form-item label="个性签名">
            <el-input
              v-model="userProfile.bio"
              type="textarea"
              placeholder="介绍一下自己吧"
              maxlength="120"
              show-word-limit
              :rows="3"
            ></el-input>
          </el-form-item>
          <el-form-item label="出生日期">
            <el-date-picker
              v-model="userProfile.birthday"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="userProfile.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
              <el-radio label="other">其他</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="所在地">
            <el-input
              v-model="userProfile.location"
              placeholder="请输入所在地"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveProfile" :loading="loading"
              >保存个人资料</el-button
            >
          </el-form-item>
        </el-form>
      </div>

      <!-- 账户安全设置 -->
      <div v-if="activeMenu === 'account'" class="settings-section">
        <h3 class="section-title">账户安全</h3>
        <div class="security-items">
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <i class="el-icon-lock"></i>
                <span>密码</span>
              </div>
              <div class="security-desc">定期更改密码可以保护您的账户安全</div>
            </div>
            <el-button
              type="primary"
              plain
              size="small"
              @click="showChangePassword = true"
              >修改密码</el-button
            >
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <i class="el-icon-mobile-phone"></i>
                <span>手机号码</span>
              </div>
              <div class="security-desc">
                {{ userInfo.phone ? userInfo.phone : "未绑定手机号码" }}
              </div>
            </div>
            <el-button type="primary" plain size="small">{{
              userInfo.phone ? "更换" : "绑定"
            }}</el-button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <i class="el-icon-message"></i>
                <span>邮箱</span>
              </div>
              <div class="security-desc">
                {{ userInfo.email ? userInfo.email : "未绑定邮箱" }}
              </div>
            </div>
            <el-button type="primary" plain size="small">{{
              userInfo.email ? "更换" : "绑定"
            }}</el-button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-title">
                <i class="el-icon-s-check"></i>
                <span>两步验证</span>
              </div>
              <div class="security-desc">
                {{ userInfo.twoFactorEnabled ? "已开启" : "未开启" }}
              </div>
            </div>
            <el-switch v-model="userInfo.twoFactorEnabled"></el-switch>
          </div>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div v-if="activeMenu === 'privacy'" class="settings-section">
        <h3 class="section-title">隐私设置</h3>
        <div class="privacy-items">
          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-title">个人资料可见性</div>
              <div class="privacy-desc">选择谁可以查看您的个人资料</div>
            </div>
            <el-select
              v-model="privacySettings.profileVisibility"
              style="width: 120px"
            >
              <el-option label="所有人" value="public"></el-option>
              <el-option label="仅好友" value="friends"></el-option>
              <el-option label="仅自己" value="private"></el-option>
            </el-select>
          </div>

          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-title">在线状态</div>
              <div class="privacy-desc">控制您的在线状态向谁可见</div>
            </div>
            <el-select
              v-model="privacySettings.onlineStatus"
              style="width: 120px"
            >
              <el-option label="所有人" value="public"></el-option>
              <el-option label="仅好友" value="friends"></el-option>
              <el-option label="仅自己" value="private"></el-option>
            </el-select>
          </div>

          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-title">好友请求</div>
              <div class="privacy-desc">谁可以向您发送好友请求</div>
            </div>
            <el-select
              v-model="privacySettings.friendRequest"
              style="width: 120px"
            >
              <el-option label="所有人" value="all"></el-option>
              <el-option label="好友的好友" value="mutual"></el-option>
              <el-option label="无人" value="none"></el-option>
            </el-select>
          </div>

          <div class="privacy-item">
            <div class="privacy-info">
              <div class="privacy-title">匿名模式</div>
              <div class="privacy-desc">在论坛中使用匿名身份发言</div>
            </div>
            <el-switch v-model="privacySettings.anonymousMode"></el-switch>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div v-if="activeMenu === 'notification'" class="settings-section">
        <h3 class="section-title">通知设置</h3>
        <div class="notification-items">
          <div class="notification-item">
            <div class="notification-info">
              <div class="notification-title">好友请求通知</div>
              <div class="notification-desc">收到好友请求时通知我</div>
            </div>
            <el-switch v-model="notificationSettings.friendRequest"></el-switch>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <div class="notification-title">私信通知</div>
              <div class="notification-desc">接收私信时通知我</div>
            </div>
            <el-switch v-model="notificationSettings.directMessage"></el-switch>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <div class="notification-title">群组消息通知</div>
              <div class="notification-desc">收到群组消息时通知我</div>
            </div>
            <el-switch v-model="notificationSettings.groupMessage"></el-switch>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <div class="notification-title">系统通知</div>
              <div class="notification-desc">接收系统公告和更新</div>
            </div>
            <el-switch v-model="notificationSettings.systemNotice"></el-switch>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <div class="notification-title">电子邮件通知</div>
              <div class="notification-desc">接收邮件通知</div>
            </div>
            <el-switch
              v-model="notificationSettings.emailNotification"
            ></el-switch>
          </div>
        </div>
      </div>

      <!-- 外观设置 -->
      <div v-if="activeMenu === 'appearance'" class="settings-section">
        <h3 class="section-title">外观设置</h3>
        <div class="theme-section">
          <div class="section-subtitle">主题</div>
          <div class="theme-options">
            <div
              v-for="theme in themes"
              :key="theme.value"
              :class="[
                'theme-option',
                { active: appearanceSettings.theme === theme.value },
              ]"
              @click="appearanceSettings.theme = theme.value"
            >
              <div
                class="theme-preview"
                :style="{ backgroundColor: theme.color }"
              >
                <div
                  class="theme-sidebar"
                  :style="{ backgroundColor: theme.sidebarColor }"
                ></div>
              </div>
              <div class="theme-name">{{ theme.label }}</div>
            </div>
          </div>
        </div>

        <div class="font-section">
          <div class="section-subtitle">字体大小</div>
          <el-slider
            v-model="appearanceSettings.fontSize"
            :min="12"
            :max="18"
            :step="1"
            show-stops
          ></el-slider>
          <div
            class="font-sample"
            :style="{ fontSize: `${appearanceSettings.fontSize}px` }"
          >
            字体大小示例文本
          </div>
        </div>

        <div class="message-display">
          <div class="section-subtitle">消息显示</div>
          <el-checkbox v-model="appearanceSettings.compactMode"
            >紧凑模式</el-checkbox
          >
          <el-checkbox v-model="appearanceSettings.showAvatars"
            >显示头像</el-checkbox
          >
        </div>
      </div>

      <!-- 语言设置 -->
      <div v-if="activeMenu === 'language'" class="settings-section">
        <h3 class="section-title">语言与地区</h3>
        <el-form
          :model="languageSettings"
          label-position="top"
          class="settings-form"
        >
          <el-form-item label="界面语言">
            <el-select v-model="languageSettings.language" style="width: 100%">
              <el-option label="简体中文" value="zh-CN"></el-option>
              <el-option label="English" value="en-US"></el-option>
              <el-option label="日本語" value="ja-JP"></el-option>
              <el-option label="한국어" value="ko-KR"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时区">
            <el-select v-model="languageSettings.timezone" style="width: 100%">
              <el-option
                label="(GMT+08:00) 北京, 香港, 台北"
                value="Asia/Shanghai"
              ></el-option>
              <el-option
                label="(GMT+09:00) 东京, 首尔"
                value="Asia/Tokyo"
              ></el-option>
              <el-option
                label="(GMT+00:00) 伦敦, 都柏林"
                value="Europe/London"
              ></el-option>
              <el-option
                label="(GMT-08:00) 洛杉矶, 旧金山"
                value="America/Los_Angeles"
              ></el-option>
              <el-option
                label="(GMT-05:00) 纽约, 华盛顿"
                value="America/New_York"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期格式">
            <el-select
              v-model="languageSettings.dateFormat"
              style="width: 100%"
            >
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD"></el-option>
              <el-option label="MM/DD/YYYY" value="MM/DD/YYYY"></el-option>
              <el-option label="DD/MM/YYYY" value="DD/MM/YYYY"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间格式">
            <el-radio-group v-model="languageSettings.timeFormat">
              <el-radio label="12">12小时制 (AM/PM)</el-radio>
              <el-radio label="24">24小时制</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog title="修改密码" v-model="showChangePassword" width="400px">
      <el-form :model="passwordForm" label-position="top">
        <el-form-item label="当前密码">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showChangePassword = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getUserProfile, updateUserProfile } from "@/api/user";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

// 加载状态
const loading = ref(false);

// 当前激活的菜单项
const activeMenu = ref("profile");

// 用户基本信息
const userInfo = reactive({
  id: "",
  username: "",
  avatar: "",
  phone: "",
  email: "",
  twoFactorEnabled: false,
});

// 个人资料表单
const userProfile = reactive({
  username: "",
  bio: "",
  birthday: "",
  gender: "male",
  location: "",
  email: "",
});

// 隐私设置
const privacySettings = reactive({
  profileVisibility: "public",
  onlineStatus: "friends",
  friendRequest: "all",
  anonymousMode: false,
});

// 通知设置
const notificationSettings = reactive({
  friendRequest: true,
  directMessage: true,
  groupMessage: true,
  systemNotice: true,
  emailNotification: false,
});

// 外观设置
const appearanceSettings = reactive({
  theme: "dark",
  fontSize: 14,
  compactMode: false,
  showAvatars: true,
});

// 语言设置
const languageSettings = reactive({
  language: "zh-CN",
  timezone: "Asia/Shanghai",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "24",
});

// 主题选项
const themes = [
  {
    label: "深色主题",
    value: "dark",
    color: "#36393f",
    sidebarColor: "#202225",
  },
  {
    label: "浅色主题",
    value: "light",
    color: "#ffffff",
    sidebarColor: "#f2f3f5",
  },
  {
    label: "紫色主题",
    value: "purple",
    color: "#42275a",
    sidebarColor: "#2e1437",
  },
  {
    label: "海洋主题",
    value: "ocean",
    color: "#1a535c",
    sidebarColor: "#0b7a75",
  },
];

// 修改密码
const showChangePassword = ref(false);
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

// 获取用户资料
const fetchUserProfile = async () => {
  loading.value = true;
  try {
    const response = await getUserProfile();

    if (response.success) {
      const profileData = response.data;

      // 更新用户基本信息
      userInfo.id = profileData._id || profileData.id;
      userInfo.username = profileData.username;
      userInfo.avatar = profileData.avatar;
      userInfo.email = profileData.email;
      userInfo.phone = profileData.phone || "";
      userInfo.twoFactorEnabled = profileData.twoFactorEnabled || false;

      // 更新个人资料表单
      userProfile.username = profileData.username;
      userProfile.bio = profileData.bio || "";
      userProfile.birthday = profileData.birthday || "";
      userProfile.gender = profileData.gender || "male";
      userProfile.location = profileData.location || "";
      userProfile.email = profileData.email || "";
    } else {
      ElMessage.error("获取用户资料失败");
    }
  } catch (error) {
    console.error("获取用户资料失败:", error);
    ElMessage.error("获取用户资料失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 保存个人资料
const saveProfile = async () => {
  // 表单验证
  if (!userProfile.username.trim()) {
    ElMessage.warning("用户名不能为空");
    return;
  }

  loading.value = true;
  try {
    const profileData = {
      username: userProfile.username,
      bio: userProfile.bio,
      birthday: userProfile.birthday,
      gender: userProfile.gender,
      location: userProfile.location,
    };

    const response = await updateUserProfile(profileData);

    if (response.success) {
      ElMessage.success("个人资料保存成功");

      // 更新本地用户信息
      userInfo.username = userProfile.username;

      // 重新获取最新的用户资料
      await fetchUserProfile();
    } else {
      ElMessage.error(response.message || "保存失败，请稍后重试");
    }
  } catch (error: any) {
    console.error("保存个人资料失败:", error);
    ElMessage.error(error.message || "保存个人资料失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 修改密码
const changePassword = () => {
  // 检查新密码和确认密码是否一致
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error("两次输入的密码不一致");
    return;
  }

  // 这里模拟修改密码
  ElMessage.success("密码修改成功");
  showChangePassword.value = false;

  // 清空表单
  passwordForm.currentPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

// 退出登录
const handleLogout = () => {
  // 清除用户信息和令牌
  userStore.logout();

  // 清除本地存储的令牌和用户信息
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  ElMessage.success("退出登录成功");

  // 跳转到登录页
  router.push("/user/login");
};

// 页面加载时获取用户资料
onMounted(async () => {
  await fetchUserProfile();
});
</script>

<style lang="scss" scoped>
.user-settings-container {
  display: flex;
  height: 100%;
  background-color: #36393f;
  color: #dcddde;
}

.settings-sidebar {
  width: 240px;
  background-color: #2f3136;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #202225;

  .settings-title {
    padding: 20px;
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: white;
  }

  .settings-menu {
    background-color: transparent;
    border-right: none;

    :deep(.el-menu-item) {
      color: #b9bbbe;
      height: 40px;
      line-height: 40px;
      background-color: transparent !important;

      &:hover {
        color: white;
        background-color: rgba(255, 255, 255, 0.05) !important;
      }

      &.is-active {
        color: white;
        background-color: rgba(255, 255, 255, 0.08) !important;
      }

      i {
        color: inherit;
        margin-right: 10px;
      }
    }
  }

  .account-info {
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;

    .user-details {
      margin-left: 10px;
      flex: 1;
      min-width: 0;

      .username {
        font-weight: 500;
        color: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-id {
        font-size: 12px;
        color: #b9bbbe;
      }
    }
  }
}

.settings-content {
  flex: 1;
  padding: 40px;
  overflow-y: auto;

  .settings-section {
    max-width: 740px;
    margin: 0 auto;

    .section-title {
      color: white;
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 24px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .section-subtitle {
      color: white;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
    }
  }

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;

    .avatar-container {
      position: relative;
      margin-bottom: 16px;
      cursor: pointer;

      .avatar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;

        i {
          font-size: 24px;
          color: white;
        }
      }

      &:hover .avatar-overlay {
        opacity: 1;
      }
    }
  }

  .settings-form {
    :deep(.el-form-item__label) {
      color: white;
      font-weight: 500;
    }

    :deep(.el-input__inner),
    :deep(.el-textarea__inner) {
      background-color: #40444b;
      border: none;
      color: white;

      &:focus {
        box-shadow: none;
      }
    }

    :deep(.el-radio__label) {
      color: #dcddde;
    }

    :deep(.el-radio__input.is-checked .el-radio__inner) {
      background-color: #5865f2;
      border-color: #5865f2;
    }

    :deep(.el-radio__input.is-checked + .el-radio__label) {
      color: #5865f2;
    }
  }

  .security-items,
  .privacy-items,
  .notification-items {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .security-item,
    .privacy-item,
    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #2f3136;
      border-radius: 5px;

      .security-info,
      .privacy-info,
      .notification-info {
        .security-title,
        .privacy-title,
        .notification-title {
          display: flex;
          align-items: center;
          font-weight: 500;
          color: white;
          margin-bottom: 4px;

          i {
            margin-right: 8px;
          }
        }

        .security-desc,
        .privacy-desc,
        .notification-desc {
          font-size: 13px;
          color: #b9bbbe;
        }
      }
    }
  }

  .theme-options {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;

    .theme-option {
      cursor: pointer;
      width: 120px;

      .theme-preview {
        height: 60px;
        border-radius: 5px;
        display: flex;
        overflow: hidden;
        border: 2px solid transparent;
        transition: all 0.2s;

        .theme-sidebar {
          width: 20%;
          height: 100%;
        }
      }

      .theme-name {
        font-size: 13px;
        text-align: center;
        margin-top: 8px;
        color: #b9bbbe;
      }

      &.active .theme-preview {
        border-color: #5865f2;
      }

      &.active .theme-name {
        color: white;
      }
    }
  }

  .font-section {
    margin-bottom: 24px;

    .font-sample {
      margin-top: 16px;
      padding: 10px;
      background-color: #2f3136;
      border-radius: 5px;
      color: white;
    }
  }

  :deep(.el-slider) {
    --el-slider-main-bg-color: #5865f2;
  }

  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #5865f2;
    border-color: #5865f2;
  }

  :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
    color: #dcddde;
  }

  :deep(.el-checkbox__label) {
    color: #dcddde;
  }

  :deep(.el-select-dropdown__item.selected) {
    color: #5865f2;
  }

  :deep(.el-switch.is-checked .el-switch__core) {
    background-color: #5865f2;
    border-color: #5865f2;
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

:deep(.el-dialog) {
  background-color: #36393f;

  .el-dialog__title {
    color: white;
  }

  .el-dialog__body,
  .el-dialog__footer {
    color: #dcddde;
  }

  .el-form-item__label {
    color: white;
  }

  .el-input__inner {
    background-color: #40444b;
    border: none;
    color: white;
  }
}
</style>
