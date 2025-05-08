/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-24 19:53:33
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-08 22:08:26
 */
import { RouteRecordRaw } from "vue-router";

const homeRoutes: RouteRecordRaw = {
  path: "/",
  name: "Home",
  component: () => import("@/views/home/index.vue"),
  meta: {
    requiresAuth: true,
  },
  children: [
    { path: "", redirect: "/home" },
    {
      path: "home",
      name: "home",
      component: () => import("@/views/home/friends/index.vue"),
      meta: {
        title: "好友/群组列表",
      },
      children: [
        {
          path: "chat",
          name: "friendsChat",
          component: () => import("@/views/chat/index.vue"),
          meta: {
            title: "聊天详细页面",
          },
        },
      ],
    },
    {
      path: "group",
      name: "group",
      component: () => import("@/views/home/groups/index.vue"),
      children: [
        {
          path: "chat",
          name: "groupsChat",
          component: () => import("@/views/chat/index.vue"),
          meta: {
            title: "群组详细页面",
          },
        },
      ],
    },
    {
      path: "forum",
      name: "forum",
      component: () => import("@/views/home/forum/index.vue"),
    },
    {
      path: "friendRequest",
      name: "friendRequest",
      component: () => import("@/views/home/notice/index.vue"),
    },
    {
      path: "userInfo",
      name: "userInfo",
      component: () => import("@/views/user/userInfo.vue"),
    },
    {
      path: "settings",
      name: "Settings",
      component: () => import("@/views/user/userSetting.vue"),
    },
  ],
};

export default homeRoutes;
