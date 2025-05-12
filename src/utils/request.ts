/*
 * @Descripttion:
 * @version:
 * @Author: Garrison
 * @Date: 2025-04-22 12:55:04
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-12 19:29:35
 */
import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  Method,
} from "axios";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";
import router from "@/router";

// 扩展 AxiosRequestConfig，添加缓存相关参数
interface ExtendedRequestConfig extends AxiosRequestConfig {
  __useCache?: boolean;
  __cacheTime?: number;
  __cacheKey?: string;
  fromCache?: boolean;
}

// 扩展 AxiosResponse，添加缓存标记
interface ExtendedResponse<T = any> extends AxiosResponse<T> {
  fromCache?: boolean;
}

// 响应结构类型
export interface ApiResponse<T = any> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  total?: number;
  totalPages?: number;
}

// 声明模块以增强AxiosInstance
declare module "axios" {
  interface AxiosInstance {
    request<T = any>(config: ExtendedRequestConfig): Promise<ApiResponse<T>>;
    get<T = any>(
      url: string,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
    delete<T = any>(
      url: string,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
    head<T = any>(
      url: string,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
    options<T = any>(
      url: string,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
    post<T = any>(
      url: string,
      data?: any,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
    put<T = any>(
      url: string,
      data?: any,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
    patch<T = any>(
      url: string,
      data?: any,
      config?: ExtendedRequestConfig
    ): Promise<ApiResponse<T>>;
  }
}

// 缓存存储
const responseCache = new Map<string, { data: any; timestamp: number }>();

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 生成缓存键
const generateCacheKey = (config: ExtendedRequestConfig): string => {
  const { method, url, params, data } = config;
  const cacheKey =
    config.__cacheKey ||
    `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(
      data || {}
    )}`;
  return cacheKey;
};

// 清除缓存
export const clearCache = (url?: string) => {
  if (url) {
    // 清除特定URL相关的所有缓存
    const keys = Array.from(responseCache.keys());
    keys.forEach((key) => {
      if (key.includes(url)) {
        responseCache.delete(key);
      }
    });
  } else {
    // 清除所有缓存
    responseCache.clear();
  }
};

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const extendedConfig = config as ExtendedRequestConfig;
    const userStore = useUserStore();

    // 添加token到请求头
    if (userStore.token) {
      config.headers["Authorization"] = `Bearer ${userStore.token}`;
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // 处理缓存
    if (extendedConfig.__useCache && config.method?.toLowerCase() === "get") {
      const cacheKey = generateCacheKey(extendedConfig);

      // 检查缓存是否存在且有效
      if (responseCache.has(cacheKey)) {
        const cachedData = responseCache.get(cacheKey);
        const cacheTime = extendedConfig.__cacheTime || 60000; // 默认1分钟

        if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
          // 标记这个请求将使用缓存
          extendedConfig.adapter = (config) => {
            return Promise.resolve({
              data: cachedData.data,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
              fromCache: true,
            });
          };
        }
      }
    }

    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: ExtendedResponse) => {
    const config = response.config as ExtendedRequestConfig;

    // 如果是从缓存获取的响应，直接返回数据
    if (response.fromCache) {
      return response.data;
    }

    const responseData = response.data;

    // 缓存GET请求的响应
    if (
      config.__useCache &&
      config.method?.toLowerCase() === "get" &&
      !response.fromCache
    ) {
      const cacheKey = generateCacheKey(config);
      responseCache.set(cacheKey, {
        data: responseData,
        timestamp: Date.now(),
      });
    }

    // 处理业务逻辑错误码
    if (responseData && responseData.code === 401) {
      // 未登录或token过期
      ElMessage.error("登录已过期，请重新登录");

      // 清除用户信息和缓存
      const userStore = useUserStore();
      userStore.logout();

      // 跳转到登录页
      router.push("/login");
      return Promise.reject(new Error("未登录或登录已过期"));
    }

    if (responseData && responseData.code !== 200 && responseData.message) {
      ElMessage.error(responseData.message);
    }

    return responseData;
  },
  (error) => {
    // 网络错误或服务器错误
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // 未授权，清除登录状态
        ElMessage.error("登录已过期，请重新登录");

        // 清除用户信息
        const userStore = useUserStore();
        userStore.logout();

        // 跳转到登录页
        router.push("/login");
      } else if (status === 403) {
        ElMessage.error("没有权限进行此操作");
      } else if (status === 404) {
        ElMessage.error("请求的资源不存在");
      } else if (status === 500) {
        ElMessage.error("服务器错误，请稍后重试");
      } else {
        ElMessage.error("请求失败，请稍后重试");
      }
    } else if (error.request) {
      ElMessage.error("网络连接失败，请检查您的网络");
    } else {
      ElMessage.error("请求配置错误");
    }

    return Promise.reject(error);
  }
);

// 封装GET请求（使用缓存版本）
export const getCached = <T = any>(
  url: string,
  params?: any,
  cacheTime?: number
): Promise<ApiResponse<T>> => {
  const config: ExtendedRequestConfig = {
    url,
    method: "get",
    params,
    __useCache: true,
    __cacheTime: cacheTime || 60000, // 默认1分钟
  };

  return service.request<T>(config);
};

// 添加直接获取不缓存的方法
export const getWithoutCache = <T = any>(
  url: string,
  params?: any
): Promise<ApiResponse<T>> => {
  return service.get<T>(url, { params });
};

export default service;
