import { useMainStore } from "./modules/home";

const appStore: any = {};
// 注册所有的store
export const registerStore = () => {
  appStore.main = useMainStore();
};

export default appStore;
