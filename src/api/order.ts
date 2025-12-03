import request from '@/utils/request';

/**
 * 订单API
 */

// 创建订单
export const createOrder = (data: {
  addressId: string;
  paymentMethod: string;
  shippingMethod?: string;
  remark?: string;
  items: Array<{
    productId?: string;
    skuId: string;
    quantity: number;
  }>;
}) => {
  return request({
    url: '/api/order/create',
    method: 'POST',
    data,
  });
};

// 获取订单列表
export const getOrderList = (pageNum: number, pageSize: number, status?: string) => {
  return request({
    url: '/api/order/list',
    method: 'GET',
    params: {
      pageNum,
      pageSize,
      status,
    },
  });
};

// 获取订单详情
export const getOrderDetail = (orderId: string) => {
  return request({
    url: `/api/order/${orderId}`,
    method: 'GET',
  });
};

// 取消订单
export const cancelOrder = (orderId: string) => {
  return request({
    url: `/api/order/${orderId}/cancel`,
    method: 'POST',
  });
};

// 确认收货
export const confirmReceipt = (orderId: string) => {
  return request({
    url: `/api/order/${orderId}/confirm-receipt`,
    method: 'POST',
  });
};
