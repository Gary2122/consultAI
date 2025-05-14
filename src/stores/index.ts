/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-09 16:26:22
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-13 20:00:23
 */
/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-09 16:26:22
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-09 16:53:50
 */
// 导出所有Pinia存储
export * from "./user";
export * from "./chat";
export * from "./friends";
export * from "./theme";
import { useUserStore } from "./user";
import { useThemeStore } from "./theme";

// 初始化函数
export function setupStores() {
  const userStore = useUserStore();
  userStore.initUser();

  const themeStore = useThemeStore();
  themeStore.initTheme();
}
