import request from '@/utils/request';

/**
 * 购物车和订单API
 */

// 获取购物车列表
export const getCartList = () => {
  return request.get('/order/cart/list');
};

// 添加到购物车
export const addToCart = (data: any) => {
  return request.post('/order/cart/add', data);
};

// 更新购物车商品数量
export const updateCartQuantity = (cartItemId: string, quantity: number) => {
  return request.put(`/order/cart/${cartItemId}`, { quantity });
};

// 删除购物车商品
export const removeFromCart = (cartItemId: string) => {
  return request.delete(`/order/cart/${cartItemId}`);
};

// 创建订单
export const createOrder = (data: any) => {
  return request.post('/order/create', data);
};

// 获取订单列表
export const getOrderList = (pageNum: number, pageSize: number, status?: string) => {
  return request.get('/order/list', {
    params: {
      pageNum,
      pageSize,
      status,
    },
  });
};

// 获取订单详情
export const getOrderDetail = (orderId: string) => {
  return request.get(`/order/${orderId}`);
};

// 取消订单
export const cancelOrder = (orderId: string) => {
  return request.post(`/order/${orderId}/cancel`);
};
