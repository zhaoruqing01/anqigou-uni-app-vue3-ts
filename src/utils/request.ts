// API 服务基础配置
import axios, { AxiosInstance } from 'axios';

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从本地存储获取 token
    const token = uni.getStorageSync('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'error',
      });
      return Promise.reject(data);
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除登录信息，跳转到登录页
      uni.removeStorageSync('token');
      uni.removeStorageSync('userId');
      uni.navigateTo({ url: '/pages/auth/login' });
    }
    uni.showToast({
      title: error.message || '网络错误',
      icon: 'error',
    });
    return Promise.reject(error);
  }
);

export default service;
