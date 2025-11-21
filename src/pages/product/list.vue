<template>
  <view class="product-list">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input v-model="keyword" placeholder="搜索商品" @confirm="handleSearch" />
      <button @click="handleSearch">搜索</button>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-tabs" scroll-x>
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="tab-item"
        :class="{ active: categoryId === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </view>
    </scroll-view>

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
            <view class="product-price">¥{{ (item.price / 100).toFixed(2) }}</view>
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="!hasMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { listProducts } from '@/api/product';
import { onMounted, ref } from 'vue';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  mainImage: string;
}

const keyword = ref('');
const categoryId = ref('');
const productList = ref<Product[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const pageSize = 20;

const categories = ref<Category[]>([
  { id: '', name: '全部' },
  { id: '1', name: '电子产品' },
  { id: '2', name: '服装' },
  { id: '3', name: '食品' },
  { id: '4', name: '图书' },
  { id: '5', name: '家居' },
]);

onMounted(() => {
  loadProducts();
});

const loadProducts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const res = await listProducts(page.value, pageSize, categoryId.value, keyword.value);

    if (res.data && res.data.length > 0) {
      productList.value.push(...res.data);
      page.value++;
      hasMore.value = res.data.length === pageSize;
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载商品失败', error);
    // 模拟数据
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: `${page.value}-${i}`,
      name: `示例商品 ${page.value}-${i + 1}`,
      price: Math.floor(Math.random() * 10000) + 1000,
      mainImage: `https://via.placeholder.com/200x200?text=Product${i + 1}`,
    }));
    productList.value.push(...mockData);
    page.value++;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  page.value = 1;
  productList.value = [];
  hasMore.value = true;
  loadProducts();
};

const selectCategory = (id: string) => {
  categoryId.value = id;
  page.value = 1;
  productList.value = [];
  hasMore.value = true;
  loadProducts();
};

const loadMore = () => {
  loadProducts();
};

const goToDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` });
};
</script>

<style scoped lang="scss">
.container {
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-bar input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
}

.search-bar button {
  padding: 12px 20px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 0 16px;
  background: white;
  border-radius: 8px;
}

.tab-item {
  padding: 12px 0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.tab-item.active {
  color: #548163;
  font-weight: 600;
  border-bottom: 2px solid #548163;
}

.tab-item:first-child {
  margin-left: 0;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.product-card:active {
  transform: scale(0.98);
}

.product-image {
  width: 100%;
  height: 150px;
  background: #f0f0f0;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}
.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
