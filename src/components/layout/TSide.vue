<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-13 20:44:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-08 15:30:08
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
      text-decoration: none;
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
      font-size: 20px;
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
        text-decoration: none;
      }

      i {
        font-size: 20px;
        color: #dcddde;
      }
    }
  }
}
</style>

<template>
  <div class="TSide w-75 text-center position-relative">
    <!-- 用户头像/主页 -->
    <router-link
      :to="routerInfo.avatarRoute.path"
      :class="routerInfo.avatarRoute.routeClass"
      :active-class="active"
    >
      <el-tooltip
        :content="routerInfo.avatarRoute.content"
        :placement="routerInfo.avatarRoute.placement"
      >
        <img src="@/assets/img/home/avartal.jpg" alt="用户头像" />
      </el-tooltip>
    </router-link>

    <div class="server-divider"></div>

    <router-link
      v-for="item in routerInfo.homeRoute"
      :to="item.path"
      :class="item.routeClass"
      :active-class="active"
    >
      <el-tooltip :content="item.content" :placement="item.placement">
        <i :class="item.icon"></i>
      </el-tooltip>
    </router-link>

    <div class="server-divider"></div>

    <router-link
      v-for="item in routerInfo.extraRoute"
      :to="item.path"
      :class="item.routeClass"
      :active-class="active"
    >
      <el-tooltip :content="item.content" :placement="item.placement">
        <i :class="item.icon"></i>
      </el-tooltip>
    </router-link>
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
      <router-link
        :to="routerInfo.settingRoute.path"
        class="setting-icon"
        :active-class="active"
      >
        <el-tooltip
          :content="routerInfo.settingRoute.content"
          placement="right"
        >
          <i :class="routerInfo.settingRoute.icon"></i>
        </el-tooltip>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts" setup>
const routerInfo = {
  avatarRoute: {
    name: "查看个人主页",
    content: "查看个人主页",
    path: "/userInfo",
    routeClass: "server-icon",
    placement: "right",
  },
  homeRoute: [
    {
      name: "个人好友",
      icon: "iconfont icon-nav_personal",
      path: "/home",
      content: "个人好友",
      routeClass: "server-icon",
      placement: "right",
    },
    {
      name: "群组聊天",
      icon: "iconfont icon-zizhanghao",
      path: "/group",
      content: "群组聊天",
      routeClass: "server-icon",
      placement: "right",
    },
    {
      name: "匿名论坛",
      icon: "iconfont icon-fenxiang",
      path: "/forum",
      content: "匿名论坛",
      routeClass: "server-icon",
      placement: "right",
    },
  ],
  extraRoute: [
    {
      name: "好友申请",
      icon: "iconfont icon-jiahao",
      path: "/friendRequest",
      content: "好友申请",
      routeClass: "server-icon",
      placement: "right",
    },
  ],
  settingRoute: {
    name: "个人设置",
    icon: "iconfont icon-xitongshezhi",
    path: "/settings",
    content: "个人设置",
    routeClass: "setting-icon",
    placement: "right",
  },
};

const active = "active";
</script>
