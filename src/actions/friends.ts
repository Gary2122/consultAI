/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-07 21:23:45
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-06-09 16:22:23
 */
// 搜索用户（根据用户名或者用户邮箱）
import { isEmpty } from "@/utils/common";
import {
  searchUsers,
  getFriendsList,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "@/api/friends";
import { ElMessage } from "element-plus";
// 搜索朋友
export const searchFriends = async (query: string) => {
  try {
    const { data } = await searchUsers(query);
    if (isEmpty(data) || isEmpty(data.success) || isEmpty(data.data)) return [];
    return data.data;
  } catch (error) {
    console.error("搜索朋友失败:", error);
    ElMessage.error("搜索朋友失败，请重试");
    return [];
  }
};

// 查看朋友列表
export const getFriends = async () => {
  try {
    const { data } = await getFriendsList();
    if (isEmpty(data)) {
      return [];
    }
    return data;
  } catch (error) {
    console.error("获取朋友列表失败:", error);
    ElMessage.error("获取朋友列表失败，请重试");
    return [];
  }
};

// 加载好友请求
export const loadFriendRequests = async () => {
  try {
    const response = await getFriendRequests();
    console.log(response.data);
    if (isEmpty(response.data) || isEmpty(response.success)) {
      console.error("获取好友请求失败:", response.data);
      ElMessage.warning("获取好友请求失败");
      return [];
    }
    return response.data.incoming;
  } catch (error) {
    console.error("获取好友请求失败:", error);
    ElMessage.error("获取好友请求失败，请重试");
    return [];
  }
};

// 接受好友请求
export const acceptRequest = async (requestId: number | string) => {
  try {
    const response = await acceptFriendRequest(requestId);
    if (isEmpty(response.data) || isEmpty(response.success)) {
      ElMessage.warning("接受好友请求数据返回错误");
      return;
    }
    ElMessage.success("已接受好友请求");
  } catch (error) {
    console.error("接受好友请求失败:", error);
    ElMessage.error("接受请求失败，请重试");
  }
};

// 拒绝好友请求
export const rejectRequest = async (requestId: number | string) => {
  try {
    const response = await rejectFriendRequest(requestId);
    if (isEmpty(response.data) || isEmpty(response.data.success)) {
      ElMessage.warning("拒绝好友请求数据返回错误");
      return;
    }
    ElMessage.success("已拒绝好友请求");
  } catch (error) {
    console.error("拒绝好友请求失败:", error);
    ElMessage.error("拒绝请求失败，请重试");
  }
};
