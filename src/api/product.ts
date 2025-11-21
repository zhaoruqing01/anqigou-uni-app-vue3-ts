import request from '@/utils/request';

/**
 * 商品API
 */

// 获取商品详情
export const getProductDetail = (productId: string) => {
  return request.get(`/product/${productId}`);
};

// 分页查询商品列表
export const listProducts = (
  pageNum: number,
  pageSize: number,
  categoryId?: string,
  keyword?: string,
  sortBy?: string
) => {
  return request.get('/product/list', {
    params: {
      pageNum,
      pageSize,
      categoryId,
      keyword,
      sortBy,
    },
  });
};

// 搜索商品
export const searchProducts = (pageNum: number, pageSize: number, keyword: string) => {
  return request.get('/product/search', {
    params: {
      pageNum,
      pageSize,
      keyword,
    },
  });
};

// 获取热门商品
export const getHotProducts = (limit: number = 10) => {
  return request.get('/product/hot', {
    params: { limit },
  });
};

// 获取推荐商品
export const getRecommendedProducts = (limit: number = 10) => {
  return request.get('/product/recommended', {
    params: { limit },
  });
};
