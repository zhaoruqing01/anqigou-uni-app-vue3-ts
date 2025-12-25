<template>
  <view class="product-list">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        v-model="keyword"
        placeholder="搜索商品"
        @confirm="handleSearch"
        focus
      />
      <button @click="handleSearch">搜索</button>
    </view>

    <!-- 分类筛选区域 -->
    <view class="filter-section">
      <!-- 排序和筛选 -->
      <view class="sort-filter">
        <view
          class="sort-item"
          :class="{ active: sortBy === '' }"
          @click="setSortBy('')"
        >
          综合
        </view>
        <view
          class="sort-item"
          :class="{ active: sortBy === 'price_asc' }"
          @click="setSortBy('price_asc')"
        >
          价格 ↑
        </view>
        <view
          class="sort-item"
          :class="{ active: sortBy === 'price_desc' }"
          @click="setSortBy('price_desc')"
        >
          价格 ↓
        </view>
        <view
          class="sort-item"
          :class="{ active: sortBy === 'hot' }"
          @click="setSortBy('hot')"
        >
          销量
        </view>
      </view>
    </view>
    <!-- 商品列表 -->
    <scroll-view class="product-scroll" scroll-y @scrolltolower="loadMore">
      <view class="product-grid">
        <view
          v-for="item in productList"
          :key="item.id"
          class="product-card"
          @click="goToDetail(item.id)"
        >
          <image :src="item.mainImage" mode="aspectFill" class="product-img" />
          <view class="product-info">
            <view class="product-name">{{ item.name }}</view>
            <view class="product-price"
              >¥{{ (item.price / 100).toFixed(2) }}</view
            >
            <view class="product-sold">已售 {{ item.soldCount }}</view>
          </view>
        </view>
      </view>
      <view class="footer-alert">
        <view v-if="loading" class="loading">加载中...</view>
        <view v-if="!hasMore" class="no-more">没有更多了</view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { listProducts } from "@/api/product";
import { ref } from "vue";

interface Category {
  id: string;
  name: string;
  level: number;
  parentId: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  mainImage: string;
  soldCount: number;
  rating: number;
}

const keyword = ref("");
const productList = ref<Product[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const pageSize = 20;
const sortBy = ref("");

// 分类相关变量
const currentCategoryId = ref("");

// 设置排序方式
const setSortBy = (sort: string) => {
  sortBy.value = sort;
  resetAndLoadProducts();
};

// 重置并加载商品
const resetAndLoadProducts = () => {
  page.value = 1;
  productList.value = [];
  hasMore.value = true;
  loadProducts();
};

const loadProducts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const res = await listProducts(
      page.value,
      pageSize,
      currentCategoryId.value,
      keyword.value,
      sortBy.value,
    );

    // 处理分页响应数据结构
    let products = [];
    if (res.data && Array.isArray(res.data)) {
      // 简单数组
      products = res.data;
    } else if (
      res.data &&
      res.data.records &&
      Array.isArray(res.data.records)
    ) {
      // 分页对象的 records 字段
      products = res.data.records;
    } else if (res.data && res.data.list && Array.isArray(res.data.list)) {
      // 分页对象的 list 字段
      products = res.data.list;
    }

    if (products.length > 0) {
      productList.value.push(...products);
      page.value++;
      hasMore.value = products.length === pageSize;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error("加载商品失败", error);
    // 模拟数据
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: `${page.value}-${i}`,
      name: `示例商品 ${page.value}-${i + 1}`,
      price: Math.floor(Math.random() * 10000) + 1000,
      originalPrice: Math.floor(Math.random() * 5000) + 15000,
      mainImage: `https://via.placeholder.com/200x200?text=Product${i + 1}`,
      soldCount: Math.floor(Math.random() * 1000),
      rating: Math.random() * 5,
    }));
    productList.value.push(...mockData);
    page.value++;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  resetAndLoadProducts();
};

const loadMore = () => {
  loadProducts();
};

const goToDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` });
};
</script>

<style scoped lang="scss">
.product-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9ff;
}

.search-bar {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  padding-left: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  background: #f5f5f5;
  height: 36px;
  line-height: 36px;
}

.search-bar input:focus {
  background: white;
  border-color: #548163;
  outline: none;
}

.search-bar button {
  background: #548163;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  height: 36px;
  line-height: 36px;
  cursor: pointer;
  flex-shrink: 0;
}

.search-bar button:active {
  opacity: 0.9;
}

// 分类筛选区域样式
.filter-section {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.first-level-categories,
.second-level-categories,
.third-level-categories {
  display: flex;
  width: 100%;
  white-space: nowrap;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.third-level-categories {
  border-bottom: none;
}

.category-item {
  display: inline-block;
  align-items: center;
  height: 30px;
  padding: 0 15px;
  margin: 0 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  border-radius: 15px;
  line-height: 30px;
}

.category-item:active {
  background: rgba(84, 129, 99, 0.05);
}

.category-item.active {
  color: white;
  background-color: #548163;
  font-weight: 600;
}

// 排序筛选样式
.sort-filter {
  display: flex;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
  flex-shrink: 0;
}

.sort-item {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.sort-item:active {
  background: rgba(84, 129, 99, 0.05);
}

.sort-item.active {
  color: #548163;
  font-weight: 600;
}

.sort-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: #548163;
  border-radius: 1px;
}

.product-scroll {
  flex: 1;
  overflow-y: auto;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
  background: #f8f9ff;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.product-card:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.product-img {
  width: 100%;
  height: 150px;
  display: block;
  background: #f0f0f0;
  object-fit: cover;
}

.product-info {
  padding: 12px 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 26px;
}

.product-price {
  font-size: 15px;
  color: #e74c3c;
  font-weight: bold;
  margin-top: 4px;
}

.product-sold {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.footer-alert {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
