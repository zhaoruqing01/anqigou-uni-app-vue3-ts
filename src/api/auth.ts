import request from '@/utils/request';

/**
 * 用户认证API
 */

// 获取验证码
export const sendVerifyCode = (phone: string) => {
  return request.post(`/api/auth/send-code?phone=${phone}`);
};

// 注册 - 手机号+密码
export const register = (data: { phone: string; password: string; nickname?: string }) => {
  return request.post('/api/auth/register', data);
};

// 密码登录
export const login = (data: any) => {
  return request.post('/api/auth/login', data);
};

// 验证码登录
export const loginWithVerifyCode = (data: any) => {
  return request.post('/api/auth/login-with-code', data);
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/api/auth/user-info');
};

// 更新用户信息
export const updateUserInfo = (data: any) => {
  return request.put('/api/auth/user-info', data);
};

// 微信登录
export const wechatLogin = (code: string, userInfo?: any) => {
  return request.post('/api/auth/wechat-login', {
    code,
    userInfo
  });
};
