/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-22 12:50:26
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-13 20:07:28
 */
import request from "@/utils/request";

// 用户登录
export const login = (username: string, password: string) => {
  return request.post("/users/login", {
    username,
    password,
  });
};

// 用户注册
export const register = (username: string, password: string, email: string) => {
  return request.post("/users/register", {
    username,
    password,
    email,
  });
};

// 用户登录态
export const getLoginStatus = () => {
  return request.get("/users/check-auth");
};

// 用户登出
export const logout = () => {
  return request.post("/users/logout");
};

// 获取用户资料 (可选参数userId，不提供则获取自己的资料)
export const getUserProfile = (userId?: string) => {
  const url = userId ? `/api/users/profile/${userId}` : "/api/users/profile";
  return request.get(url);
};

// 更新用户资料
export const updateUserProfile = (profileData: any) => {
  return request.put("/api/users/profile", profileData);
};

// 更新用户在线状态
export const updateUserStatus = (status: string, visibility?: string) => {
  return request.put("/api/users/status", {
    status,
    visibility,
  });
};

// 获取用户在线状态
export const getUserStatus = (userId: string) => {
  return request.get(`/api/users/${userId}/status`);
};

// 添加用户活动记录
export const addUserActivity = (activityData: {
  type: string;
  title: string;
  description?: string;
}) => {
  return request.post("/api/users/profile/activity", activityData);
};

// 添加测评结果
export const addUserAssessment = (assessmentData: {
  name: string;
  score: number;
  description?: string;
}) => {
  return request.post("/api/users/profile/assessment", assessmentData);
};
