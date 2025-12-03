import request from '@/utils/request';

/**
 * 购物车API
 */

// 添加商品到购物车
export const addToCart = (data: { productId: string; skuId: string; quantity: number }) => {
  return request({
    url: '/api/cart/add',
    method: 'POST',
    data,
  });
};

// 获取购物车列表
export const getCartList = () => {
  return request({
    url: '/api/cart/list',
    method: 'GET',
  });
};

// 更新购物车商品数量
export const updateCartQuantity = (data: { skuId: string; quantity: number }) => {
  return request({
    url: '/api/cart/update',
    method: 'PUT',
    data,
  });
};

// 移除购物车商品
export const removeCartItem = (skuId: string) => {
  return request({
    url: '/api/cart/remove',
    method: 'DELETE',
    params: { skuId },
  });
};

// 清空购物车
export const clearCart = () => {
  return request({
    url: '/api/cart/clear',
    method: 'DELETE',
  });
};
