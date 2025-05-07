/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-07 21:23:45
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-07 21:55:02
 */
// 搜索用户（根据用户名或者用户邮箱）
import { isEmpty } from "@/utils/common";
import { searchUsers, getFriendsList } from "@/api/friends";
import { ElMessage, ElMessageBox } from "element-plus";
// 搜索朋友
export const searchFriends = async (query: string) => {
  const { data } = await searchUsers(query);
  if (isEmpty(data) || isEmpty(data.success) || isEmpty(data.data)) return [];
  return data.data;
};

// 查看朋友列表
export const getFriends = async () => {
  const { data } = await getFriendsList();
  if (isEmpty(data) || isEmpty(data.success) || isEmpty(data.data)) {
    ElMessage.warning("获取朋友列表失败");
    return [];
  }
  return data.data;
};
