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

/**
 * 模拟支付请求参数
 */
export interface MockPayRequest {
  orderId: string; // 订单ID - 必填
  amount: number; // 支付金额（单位：分）- 必填
  paymentMethod?: string; // 支付方式（wechat、alipay、mock）- 可选，默认为mock
  userId?: string; // 用户ID - 可选，如果不传则从订单服务获取
  description?: string; // 商品描述 - 可选
  autoShip?: boolean; // 是否自动发货 - 可选，默认true，30秒后自动发货
}

/**
 * 模拟支付响应数据
 */
export interface MockPayResponse {
  paymentId: string; // 支付记录ID
  orderId: string; // 订单ID
  orderNo: string; // 订单号
  paymentNo: string; // 支付单号
  userId: string; // 用户ID
  amount: number; // 支付金额（单位：分）
  paymentMethod: string; // 支付方式
  status: string; // 支付状态（paid-已支付）
  transactionId: string; // 模拟交易号
  paidTime: string; // 支付完成时间
  createTime: string; // 创建时间
  message: string; // 提示消息
  autoShip: boolean; // 是否会自动发货
}

/**
 * 模拟支付 - 直接完成支付
 *
 * @param data 模拟支付请求参数
 * @returns 支付结果
 */
export const mockPay = (data: MockPayRequest) => {
  return request.post<MockPayResponse>('/api/payment/mock/pay', data);
};

/**
 * 模拟支付 - 简化版本（兼容旧代码）
 *
 * @param orderId 订单ID
 * @param paymentMethod 支付方式
 * @param amount 支付金额（单位：分）
 * @returns 支付结果
 */
export const mockPaySimple = (orderId: string, paymentMethod: string, amount: number) => {
  return request.post<MockPayResponse>('/api/payment/mock/pay', {
    orderId,
    paymentMethod,
    amount,
  });
};
