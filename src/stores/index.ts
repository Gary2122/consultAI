/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-09 16:26:22
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-09 20:00:23
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
import { useUserStore } from "./user";
// 初始化函数
export function setupStores() {
  const userStore = useUserStore();
  userStore.initUser();
}
