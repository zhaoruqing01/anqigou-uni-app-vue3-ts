/**
 * 商品相关类型定义
 */

// 商品分类
export interface ProductCategory {
  id: string;
  parentId?: string;
  name: string;
  iconUrl?: string;
  description?: string;
  level: number; // 1-一级，2-二级，3-三级
  sortOrder: number;
  status: number; // 0-禁用，1-启用
  createTime?: string;
  updateTime?: string;
}

// 商品列表项
export interface ProductListItem {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  brand?: string;
  price: number; // 单位：分
  originalPrice: number; // 单位：分
  stock: number;
  soldCount: number;
  rating: number; // 0-5分
  ratingCount: number;
  mainImage: string;
  images?: string[];
  status: number; // 0-下架，1-上架
  shelfTime?: string;
}

// 商品详情
export interface ProductDetail extends ProductListItem {
  description?: string;
  videoUrl?: string;
  skus: ProductSku[];
}

// 商品规格
export interface ProductSku {
  id: string;
  productId: string;
  specName: string;
  specValueJson: Record<string, string>; // 如 {color: "红色", size: "L"}
  price: number;
  stock: number;
  barcode?: string;
}

// 分页响应
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 筛选条件
export interface ProductFilter {
  categoryId?: string;
  brands?: string[]; // 品牌
  minPrice?: number; // 最低价格（分）
  maxPrice?: number; // 最高价格（分）
  stockStatus?: 'all' | 'in_stock' | 'out_of_stock'; // 库存状态
  sortBy?: 'comprehensive' | 'sales' | 'price_asc' | 'price_desc' | 'rating' | 'new'; // 排序方式
}

// 商品评价
export interface ProductReview {
  id: string;
  productId: string;
  orderId: string;
  userId: string;
  rating: number; // 1-5星
  content?: string;
  images?: string[];
  isAnonymous: boolean;
  helpfulCount: number;
  createTime: string;
  // 用户信息（后端返回）
  userNickname?: string;
  userAvatar?: string;
}

// 评价统计
export interface ReviewStats {
  totalCount: number;
  goodCount: number; // 好评数
  mediumCount: number; // 中评数
  badCount: number; // 差评数
  goodRate: number; // 好评率
  avgRating: number; // 平均评分
}
