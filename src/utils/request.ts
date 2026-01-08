// API 服务基础配置
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter';
import axios from 'axios';

// 定义响应数据类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

// 创建 axios 实例 - 统一通过网关访问
const URL_NGROK = 'http://y6252f63.natappfree.cc';
// const LOCAL_URL = 'http://localhost:8080';
const service = axios.create({
  baseURL: URL_NGROK,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: createUniAppAxiosAdapter(),
});

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    // 从本地存储获取 token 和 userId
    const token = uni.getStorageSync('token');
    const userId = uni.getStorageSync('userId');
    if (config.headers) {
      // 设置请求头
      config.headers['Accept'] = 'application/json';
      config.headers['Content-Type'] = 'application/json';
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // 添加 userId 到请求头
      if (userId) {
        config.headers['X-User-Id'] = userId;
      }
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: any) => {
    console.log(response, 'response');

    const data = response.data;

    // 特殊处理：购物车中不存在商品的情况不视为错误
    const isCartRemovalSuccess =
      data.message && data.message.includes('Remove item from cart failed: 购物车中不存在该商品');

    // 检查响应码（后端成功返回200）
    if (data.code !== 200 && data.code !== 0 && !isCartRemovalSuccess) {
      const errorMsg = data.message || '请求失败';
      console.error('[接口错误] ', {
        url: response.config?.url,
        code: data.code,
        message: errorMsg,
        data: data.data,
        timestamp: new Date().toLocaleTimeString(),
      });
      // uni.showToast({
      //   title: errorMsg,
      //   icon: 'error',
      // });
      return Promise.reject(data);
    }

    // 如果是购物车移除操作且商品不存在，返回成功状态
    if (isCartRemovalSuccess) {
      return {
        code: 200,
        message: '删除成功',
        data: null,
      };
    }

    return data;
  },
  (error: any) => {
    const errorMsg = error?.message || '网络错误';
    console.error('[网络错误] ', {
      url: error?.config?.url,
      status: error?.response?.status,
      message: errorMsg,
      response: error?.response?.data,
      timestamp: new Date().toLocaleTimeString(),
    });

    if (error.response?.status === 401) {
      // 清除登录信息，跳转到登录页
      uni.removeStorageSync('token');
      uni.removeStorageSync('userId');
      uni.removeStorageSync('userRole');
      uni.navigateTo({ url: '/pages/auth/login' });
    } else if (error.response?.status === 403) {
      uni.showToast({
        title: '无访问权限',
        icon: 'error',
      });
    } else if (error.response?.status === 404) {
      uni.showToast({
        title: '请求的资源不存在',
        icon: 'error',
      });
    } else if (error.response?.status === 500) {
      uni.showToast({
        title: '服务器错误，请稍后重试',
        icon: 'error',
      });
    } else if (error.response?.status === 400) {
      // 400 错误可能是请求参数或属性问题
      console.error('[400 错误详情]', error.response?.data);
    } else if (!error.response) {
      // 网络不可用，一般是后端未启动
      uni.showToast({
        title: '无法连接到服务器，请确保后端已启动',
        icon: 'error',
      });
    } else if (error.response?.status >= 400 && error.response?.status < 500) {
      // 客户端错误
      const errorData = error.response?.data;
      const message = errorData?.message || errorMsg;
      uni.showToast({
        title: message,
        icon: 'error',
      });
    } else {
      // uni.showToast({
      //   title: errorMsg,
      //   icon: 'error',
      // });
    }
    return Promise.reject(error);
  }
);

/**
 * 外部接口实例：用于请求第三方接口（如省市区CDN、GitHub接口）
 * 特点：无 baseURL、无响应 code 校验、简化拦截器
 */
const externalService = axios.create({
  timeout: 15000, // 外部接口超时时间设长一点（15秒）
  adapter: createUniAppAxiosAdapter(), // 复用 Uniapp 适配器
});

// 外部接口请求拦截器：仅处理必要逻辑，不添加非法头
externalService.interceptors.request.use(
  (config: any) => {
    // 额外移除可能存在的非法头（保险起见）
    delete config.headers['Access-Control-Allow-Origin'];
    delete config.headers['Access-Control-Allow-Methods'];
    return config;
  },
  (error: any) => Promise.reject(error)
);

// 外部接口响应拦截器：不校验 code，直接返回原始数据
externalService.interceptors.response.use(
  (response: any) => {
    // 第三方接口返回的是纯 JSON 数据，直接返回，不做 code 校验
    return response.data;
  },
  (error: any) => {
    // 外部接口错误单独处理
    const errorMsg = error?.message || '第三方接口请求失败';
    console.error('[外部接口错误] ', { url: error?.config?.url, message: errorMsg });
    uni.showToast({ title: errorMsg, icon: 'none' });
    return Promise.reject(error);
  }
);

export { service as default, externalService };
