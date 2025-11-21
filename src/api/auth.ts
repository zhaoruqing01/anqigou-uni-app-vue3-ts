import request from '@/utils/request';

/**
 * 用户认证API
 */

// 获取验证码
export const sendVerifyCode = (phone: string) => {
  return request.post('/auth/send-code', { phone });
};

// 注册
export const register = (data: any) => {
  return request.post('/auth/register', data);
};

// 密码登录
export const login = (data: any) => {
  return request.post('/auth/login', data);
};

// 验证码登录
export const loginWithVerifyCode = (data: any) => {
  return request.post('/auth/login-with-code', data);
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/auth/user-info');
};

// 更新用户信息
export const updateUserInfo = (data: any) => {
  return request.put('/auth/user-info', data);
};
