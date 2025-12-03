import request from '@/utils/request';

/**
 * 用户收藏API
 */

// 添加收藏
export const addFavorite = (productId: string) => {
  return request.post(`/api/user/favorite/add/${productId}`);
};

// 取消收藏
export const cancelFavorite = (productId: string) => {
  return request.delete(`/api/user/favorite/cancel/${productId}`);
};

// 批量取消收藏
export const batchCancelFavorite = (productIds: string[]) => {
  return request.delete('/api/user/favorite/batch-cancel', {
    data: productIds,
  });
};

// 查询收藏列表
export const listFavorites = (pageNum: number = 1, pageSize: number = 10) => {
  return request.get('/api/user/favorite/list', {
    params: {
      pageNum,
      pageSize,
    },
  });
};

// 检查商品是否已收藏
export const checkFavorite = (productId: string) => {
  return request.get(`/api/user/favorite/check/${productId}`);
};
