/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-24 19:53:33
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-04-27 13:35:24
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
      component: () => import("@/views/friends/index.vue"),
      meta: {
        title: "好友/群组列表",
      },
      children: [
        { path: "", redirect: "/home/chat" },
        {
          path: "chat",
          name: "chat",
          component: () => import("@/views/chat/index.vue"),
          meta: {
            title: "聊天详细页面",
          },
        },
      ],
    },
    {
      path: "properties",
      name: "Properties",
      component: () => import("@/views/properties/index.vue"),
    },
    {
      path: "chat",
      name: "Chat",
      component: () => import("@/views/chat/index.vue"),
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
      component: () => import("@/views/settings/index.vue"),
    },
  ],
};

export default homeRoutes;
