/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-13 20:44:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-04-26 14:45:09
 */
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "@/views/user/Login.vue";
import Register from "@/views/user/Register.vue";
import homeRoutes from "./modules/home";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/home",
    component: () => import("@/views/home/index.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "forum",
        name: "Forum",
        component: () => import("@/views/home/forum/index.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
  homeRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 添加路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("token"); // 假设登录后会在localStorage中存储token

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
