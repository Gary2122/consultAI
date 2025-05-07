/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-14 19:56:07
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-07 21:21:26
 */
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
};
