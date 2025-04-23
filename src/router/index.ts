import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
// import Chat from '@/views/chat';
import Home from '@/views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  // {
  //   path: '/chat',
  //   name: 'Chat',
  //   component: Chat,
  //   meta: { requiresAuth: true }
  // },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/index" },
      {
        path: "index",
        name: "home",
        component: () => import("../views/chat/index.vue"),
        meta: {
          title: "场地介绍",
        },
      },
      // { path: "/contact", name: "Contact", component: () => import("../views/Contact.vue") },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


// 添加路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // 假设登录后会在localStorage中存储token

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;