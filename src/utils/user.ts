// 获取用户设置
export const getUserSetting = () => {
  const userSetting = localStorage.getItem("userSetting");
  if (!userSetting) {
    return { theme: "light" };
  }
  return JSON.parse(userSetting);
};

export const setUserSetting = (setting: { theme: string }) => {
  localStorage.setItem("userSetting", JSON.stringify(setting));
}
