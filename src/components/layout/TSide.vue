<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-13 20:44:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-04-24 19:54:09
-->
<style lang="scss" scoped>
.TSide {
  height: calc(100vh - 98px);
  background-color: #202225;
  color: #dcddde;
  transition: background-color 0.3s, color 0.3s;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  .server-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #36393f;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 12px auto;
    cursor: pointer;
    transition: border-radius 0.2s, background-color 0.2s;
    position: relative;

    &:hover {
      background-color: #5865f2;
      border-radius: 16px;
    }

    &.active {
      background-color: #5865f2;
      border-radius: 16px;

      &::before {
        content: "";
        position: absolute;
        left: -8px;
        width: 4px;
        height: 32px;
        border-radius: 0 4px 4px 0;
        background-color: white;
      }
    }

    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
    }

    i {
      font-size: 24px;
      color: #dcddde;
    }
  }

  .server-divider {
    height: 2px;
    width: 32px;
    background-color: #36393f;
    margin: 8px auto;
  }

  .user-settings {
    margin-top: auto;
    padding: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    align-items: center;
    justify-content: center;

    .setting-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #36393f;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-radius 0.2s, background-color 0.2s;

      &:hover {
        background-color: #5865f2;
        border-radius: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="TSide w-75 text-center position-relative">
    <!-- 用户头像/主页 -->
    <router-link to="/home" class="server-icon active">
      <img src="@/assets/img/home/avartal.jpg" alt="用户头像" />
    </router-link>

    <div class="server-divider"></div>

    <!-- 个人好友聊天 -->
    <router-link to="/home/friends" class="server-icon">
      <el-tooltip content="个人好友" placement="right">
        <i class="el-icon-user"></i>
      </el-tooltip>
    </router-link>

    <!-- 群组聊天 -->
    <router-link to="/home/groups" class="server-icon">
      <el-tooltip content="群组聊天" placement="right">
        <i class="el-icon-s-cooperation"></i>
      </el-tooltip>
    </router-link>

    <!-- 匿名论坛 -->
    <router-link to="/home/forum" class="server-icon">
      <el-tooltip content="匿名论坛" placement="right">
        <i class="el-icon-s-comment"></i>
      </el-tooltip>
    </router-link>

    <div class="server-divider"></div>

    <!-- 添加服务器/群组按钮 -->
    <div class="server-icon">
      <el-tooltip content="添加服务器" placement="right">
        <i class="el-icon-plus"></i>
      </el-tooltip>
    </div>

    <!-- 发现更多 -->
    <div class="server-icon">
      <el-tooltip content="发现" placement="right">
        <i class="el-icon-discover"></i>
      </el-tooltip>
    </div>

    <!-- 设置按钮 (底部) -->
    <div class="user-settings">
      <router-link to="/home/settings" class="setting-icon">
        <el-tooltip content="用户设置" placement="right">
          <i class="el-icon-setting"></i>
        </el-tooltip>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
