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
// 初始化函数
export function setupStores() {
  // 初始化用户状态
  // 如果没有登录状态，则在开发环境中初始化模拟用户
  // if (!userStore.isLoggedIn && import.meta.env.DEV) {
  //   console.log("初始化模拟用户数据（仅开发环境）");
  //   userStore.initMockUser();
  // }
}
