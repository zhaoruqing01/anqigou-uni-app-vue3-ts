// API 服务基础配置
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";
import axios from "axios";

// 创建 axios 实例
// 根据路由前缀动态选择不同微服务的基础URL
function getBaseURL(path: string): string {
  if (path.startsWith("/auth") || path.startsWith("/user")) {
    return "http://localhost:8081/api"; // 用户服务
  } else if (path.startsWith("/order")) {
    return "http://localhost:8082/api"; // 订单服务
  } else if (path.startsWith("/product")) {
    return "http://localhost:8083/api"; // 商品服务
  } else if (path.startsWith("/payment")) {
    return "http://localhost:8084/api"; // 支付服务
  } else if (path.startsWith("/logistics")) {
    return "http://localhost:8085/api"; // 物流服务
  }
  return "http://localhost:8081/api"; // 默认用户服务
}

// 创建 axios 实例
const service = axios.create({
  baseURL: "http://localhost:8081/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  adapter: createUniAppAxiosAdapter(),
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 根据路由动态选择基础URL
    if (config.url) {
      config.baseURL = getBaseURL(config.url);
    }
    // 从本地存储获取 token 和 userId
    const token = uni.getStorageSync("token");
    const userId = uni.getStorageSync("userId");
    if (config.headers) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // 添加 userId 到请求头
      if (userId) {
        config.headers["X-User-Id"] = userId;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const data = response.data;

    // 检查响应码
    if (data.code !== 0) {
      const errorMsg = data.message || "请求失败";
      console.error("[接口错误] ", {
        url: response.config?.url,
        code: data.code,
        message: errorMsg,
        data: data.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      uni.showToast({
        title: errorMsg,
        icon: "error",
      });
      return Promise.reject(data);
    }
    return data;
  },
  (error) => {
    const errorMsg = error?.message || "网络错误";
    console.error("[网络错误] ", {
      url: error?.config?.url,
      status: error?.response?.status,
      message: errorMsg,
      response: error?.response?.data,
      timestamp: new Date().toLocaleTimeString(),
    });

    if (error.response?.status === 401) {
      // 清除登录信息，跳转到登录页
      uni.removeStorageSync("token");
      uni.removeStorageSync("userId");
      uni.removeStorageSync("userRole");
      uni.navigateTo({ url: "/pages/auth/login" });
    } else if (error.response?.status === 403) {
      uni.showToast({
        title: "无访问权限",
        icon: "error",
      });
    } else if (error.response?.status === 404) {
      uni.showToast({
        title: "请求的资源不存在",
        icon: "error",
      });
    } else if (error.response?.status === 500) {
      uni.showToast({
        title: "服务器错误，请稍后重试",
        icon: "error",
      });
    } else if (error.response?.status === 400) {
      // 400 错误可能是请求参数或属性问题
      console.error("[400 错误详情]", error.response?.data);
    } else if (!error.response) {
      // 网络不可用，一般是后端未启动
      uni.showToast({
        title: "无法连接到服务器，请确保后端已启动",
        icon: "error",
      });
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      // 客户端错误
      const errorData = error.response?.data;
      const message = errorData?.message || errorMsg;
      uni.showToast({
        title: message,
        icon: "error",
      });
    } else {
      uni.showToast({
        title: errorMsg,
        icon: "error",
      });
    }
    return Promise.reject(error);
  }
);

export default service;
