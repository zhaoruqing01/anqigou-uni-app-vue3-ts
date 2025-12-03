import { defineStore } from 'pinia';
import { ref } from 'vue';

interface User {
  userId?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  memberLevel?: number;
  totalConsumption?: number;
  availablePoints?: number;
  role?: string; // 用户角色: user, seller, admin
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  user.value = {
    avatar: 'https://www.eduplus.net/static/png/icon_man.a973c7241764321712803.png' as string,
  };
  const token = ref<string>('');
  const isLogin = ref<boolean>(false);

  // 设置用户信息
  const setUser = (userData: User) => {
    user.value = userData;
    isLogin.value = true;
    uni.setStorageSync('userData', JSON.stringify(userData));
    // 单独保存 userId 供请求拦截器使用
    if (userData.userId) {
      uni.setStorageSync('userId', userData.userId);
    }
  };

  // 设置 Token
  const setToken = (newToken: string) => {
    token.value = newToken;
    uni.setStorageSync('token', newToken);
  };

  // 清除用户信息
  const logout = () => {
    user.value = null;
    token.value = '';
    isLogin.value = false;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userData');
    uni.removeStorageSync('userId');
  };

  // 从存储恢复用户信息
  const restoreFromStorage = () => {
    const storedToken = uni.getStorageSync('token');
    if (storedToken) {
      token.value = storedToken;
      isLogin.value = true;
    }
  };

  return {
    user,
    token,
    isLogin,
    setUser,
    setToken,
    logout,
    restoreFromStorage,
  };
});
