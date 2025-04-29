/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-24 19:53:33
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-04-29 15:44:35
 */
import { RouteRecordRaw } from "vue-router";

const homeRoutes: RouteRecordRaw = {
  path: "/",
  name: "Home",
  component: () => import("@/views/Home.vue"),
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
      path: "calendar",
      name: "Calendar",
      component: () => import("@/views/calendar/index.vue"),
    },
    {
      path: "offer",
      name: "Offer",
      component: () => import("@/views/offer/index.vue"),
    },
    {
      path: "documents",
      name: "Documents",
      component: () => import("@/views/documents/index.vue"),
    },
    {
      path: "settings",
      name: "Settings",
      component: () => import("@/views/home/userSetting/index.vue"),
    },
  ],
};

export default homeRoutes;
