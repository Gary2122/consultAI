// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/style/index";
import "@/assets/style/_vars.scss";
import "virtual:uno.css";
import "@/style/theme.css";
import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";
import Vue3Lottie from "vue3-lottie";
import { createPinia } from "pinia";
import { setupStores } from "./stores";
// import piniaPersist from "pinia-plugin-persist"; //数据持久化

const pinia = createPinia();
// pinia.use(piniaPersist);
createApp(App)
  .use(router)
  .use(ElementPlus)
  .use(pinia)
  .use(Vue3Lottie)
  .mount("#app");
setupStores(); // 初始化Pinia存储
