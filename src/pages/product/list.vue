<template>
  <view class="product-list">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input v-model="keyword" placeholder="搜索商品" @confirm="handleSearch" />
      <button @click="handleSearch">搜索</button>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-tabs">
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

    <!-- <scroll-view class="category-tabs" scroll-x>
      <view
        v-for="cat in categories"
        :key="cat.id"
        class="tab-item"
        :class="{ active: categoryId === cat.id }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.name }}
      </view>
    </scroll-view> -->

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
          </view>
        </view>
      </view>
      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="!hasMore" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { listProducts } from "@/api/product";
import { onMounted, ref } from "vue";

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

const keyword = ref("");
const categoryId = ref("");
const productList = ref<Product[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);
const pageSize = 20;

const categories = ref<Category[]>([
  { id: "", name: "全部" },
  { id: "1", name: "电子产品" },
  { id: "2", name: "服装" },
  { id: "3", name: "食品" },
  { id: "4", name: "图书" },
  { id: "5", name: "家居" },
  { id: "6", name: "运动" },
  { id: "7", name: "其他" },
]);

onMounted(() => {
  loadProducts();
});

const loadProducts = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const res = await listProducts(
      page.value,
      pageSize,
      categoryId.value,
      keyword.value
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
.product-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9ff;
}

.search-bar {
  display: flex;
  gap: 8px;
  // padding: 12px;
  padding: 10px 12px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.search-bar input {
  flex: 1;
  // padding: 10px 16px;
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
  // padding: 8px 20px;
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

.category-tabs {
  display: flex;
  width: 100%;
  white-space: nowrap;
}

.tab-item {
  display: inline-block;
  align-items: center;
  width: fit-content;
  height: 30px;
  padding: 10px 15px;
  background-color: #f9f9f9;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.tab-item:active {
  background: rgba(84, 129, 99, 0.05);
}

.tab-item.active {
  color: #548163;
  font-weight: 600;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 3px;
  background: #548163;
  border-radius: 1.5px;
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

.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
