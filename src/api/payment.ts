import request from '@/utils/request';

/**
 * 支付API
 */

// 创建支付单
export const createPayment = (orderId: string, paymentMethod: string) => {
  return request.post('/api/payment/create', {
    orderId,
    paymentMethod,
  });
};

// 查询支付状态
export const queryPaymentStatus = (orderId: string) => {
  return request.get(`/api/payment/status/${orderId}`);
};

// 微信支付
export const wechatPay = (data: any) => {
  return request.post('/api/payment/wechat', data);
};

// 支付宝支付
export const aliPay = (data: any) => {
  return request.post('/api/payment/alipay', data);
};
