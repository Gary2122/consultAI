/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-13 20:44:12
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-14 19:38:50
 */
import { useMainStore } from "./modules/home";

const appStore: any = {};
// 注册所有的store
export const registerStore = () => {
  appStore.main = useMainStore();
};

export default appStore;
