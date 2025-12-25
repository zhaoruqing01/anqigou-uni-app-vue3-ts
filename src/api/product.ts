import request from '@/utils/request';

/**
 * 商品API
 */

// 获取商品详情
export const getProductDetail = (productId: string) => {
  return request.get(`/api/product/${productId}`);
};

// 分页查询商品列表
export const listProducts = (
  pageNum: number,
  pageSize: number,
  categoryId?: string,
  keyword?: string,
  sortBy?: string
) => {
  return request.get('/api/product/list', {
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
  return request.get('/api/product/search', {
    params: {
      pageNum,
      pageSize,
      keyword,
    },
  });
};

// 获取热门商品
export const getHotProducts = (limit: number = 10) => {
  return request.get('/api/product/hot', {
    params: { limit },
  });
};

// 获取推荐商品
export const getRecommendedProducts = (limit: number = 10) => {
  return request.get('/api/product/recommended', {
    params: {
      limit,
    },
  });
};

// 获取所有商品分类
export const listCategories = () => {
  return request.get('/api/product/categories');
};

// 获取一级分类列表
export const listFirstLevelCategories = () => {
  return request.get('/api/product/categories/first-level');
};

// 获取子分类列表
export const listSubCategories = (parentId: string) => {
  return request.get('/api/product/categories/sub', {
    params: {
      parentId,
    },
  });
};
