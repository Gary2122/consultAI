import request from "@/utils/request";

// 用户登录
export const login = (username: string, password: string) => {
  return request({
    url: "/users/login",
    method: "post",
    data: {
      username,
      password,
    },
  });
};

// 用户注册
export const register = (username: string, password: string, email: string) => {
  return request({
    url: "/users/register",
    method: "post",
    data: {
      username,
      password,
      email,
    },
  });
};

// 用户登录态
export const getLoginStatus = () => {
  return request({
    url: "/users/check-auth",
    method: "get",
  });
};

// 获取用户资料 (可选参数userId，不提供则获取自己的资料)
export const getUserProfile = (userId?: string) => {
  const url = userId ? `/api/users/profile/${userId}` : "/api/users/profile";
  return request({
    url,
    method: "get",
  });
};

// 更新用户资料
export const updateUserProfile = (profileData: any) => {
  return request({
    url: "/api/users/profile",
    method: "put",
    data: profileData,
  });
};

// 添加用户活动记录
export const addUserActivity = (activityData: {
  type: string;
  title: string;
  description?: string;
}) => {
  return request({
    url: "/api/users/profile/activity",
    method: "post",
    data: activityData,
  });
};

// 添加测评结果
export const addUserAssessment = (assessmentData: {
  name: string;
  score: number;
  description?: string;
}) => {
  return request({
    url: "/api/users/profile/assessment",
    method: "post",
    data: assessmentData,
  });
};
