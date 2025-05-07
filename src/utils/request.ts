/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-22 12:55:04
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-07 21:19:25
 */
import axios from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";

// 创建Axios实例
const request = axios.create({
  baseURL: "http://localhost:3000", // 替换为你的API基础URL
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 处理 401 未登录情况
    if (response.data.code === 401) {
      // 清除本地存储的登录信息
      localStorage.removeItem("token");
      localStorage.removeItem("userId");

      // 显示提示信息
      ElMessage.warning("请先登录");

      // 跳转到登录页面
      router.push("/login");

      // 返回 Promise.reject，中断后续处理
      return Promise.reject(new Error("请先登录"));
    }

    return response;
  },
  (error) => {
    // 处理网络错误等
    return Promise.reject(error);
  }
);

export default request;
