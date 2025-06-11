/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-13 20:44:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-06-11 17:24:28
 */
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/style/index";
import "@/assets/style/_vars.scss";
import "virtual:uno.css";
import "@/style/theme.css"; // Theme CSS
import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";
import Vue3Lottie from "vue3-lottie";
import { createPinia } from "pinia";
import { setupStores } from "./stores";
// import piniaPersist from "pinia-plugin-persist"; //数据持久化
import "./assets/iconfont/iconfont";
import ".//assets/iconfont/iconfont.css";

const pinia = createPinia();
// pinia.use(piniaPersist);
createApp(App)
  .use(router)
  .use(ElementPlus)
  .use(pinia)
  .use(Vue3Lottie)
  .mount("#app");
setupStores(); // 初始化Pinia存储
