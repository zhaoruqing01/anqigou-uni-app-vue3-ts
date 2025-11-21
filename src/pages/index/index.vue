<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="top-nav">
      <view class="nav-item active" @click="goToIndex">首页</view>
      <view class="nav-item" @click="goToCategory">分类</view>
      <view class="nav-item" @click="goToCart">购物车</view>
      <view class="nav-item" @click="goToProfile">我的</view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <input v-model="searchKeyword" placeholder="搜索商品" type="text" @confirm="handleSearch" />
      <button @click="handleSearch">搜索</button>
    </view>

    <!-- 轮播图 -->
    <swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="5000">
      <swiper-item v-for="(banner, i) in banners" :key="i" @click="handleBannerClick(banner)">
        <image :src="banner.imageUrl" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 快捷菜单 -->
    <view class="quick-menu">
      <view class="menu-item" @click="goToCategory">
        <view class="menu-icon">📋</view>
        <view class="menu-text">分类</view>
      </view>
      <view class="menu-item" @click="goToOrders">
        <view class="menu-icon">📦</view>
        <view class="menu-text">订单</view>
      </view>
      <view class="menu-item" @click="goToFavorites">
        <view class="menu-icon">❤️</view>
        <view class="menu-text">收藏</view>
      </view>
      <view class="menu-item" @click="goToService">
        <view class="menu-icon">💬</view>
        <view class="menu-text">客服</view>
      </view>
    </view>

    <!-- 热门商品 -->
    <view class="section">
      <view class="section-title">热门商品</view>
      <view class="product-grid">
        <view
          v-for="product in hotProducts"
          :key="product.id"
          class="product-item"
          @click="goToDetail(product.id)"
        >
          <image :src="product.mainImage" mode="aspectFill" />
          <view class="product-name">{{ product.name }}</view>
          <view class="product-price">¥{{ (product.price / 100).toFixed(2) }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getHotProducts } from '@/api/product';
import { onMounted, ref } from 'vue';

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  productId?: string;
}

const searchKeyword = ref('');
const hotProducts = ref<any[]>([]);
const banners = ref<Banner[]>([
  { id: '1', imageUrl: 'https://via.placeholder.com/375x200?text=Banner1' },
  { id: '2', imageUrl: 'https://via.placeholder.com/375x200?text=Banner2' },
  { id: '3', imageUrl: 'https://via.placeholder.com/375x200?text=Banner3' },
]);

onMounted(async () => {
  try {
    const res = await getHotProducts(10);
    if (res.data && res.data.length > 0) {
      hotProducts.value = res.data;
    } else {
      // 模拟数据
      hotProducts.value = Array.from({ length: 6 }, (_, i) => ({
        id: `hot-${i}`,
        name: `热门商品 ${i + 1}`,
        price: Math.floor(Math.random() * 10000) + 1000,
        mainImage: `https://via.placeholder.com/200x200?text=Hot${i + 1}`,
      }));
    }
  } catch (e) {
    console.error('Failed to fetch hot products', e);
    // 模拟数据
    hotProducts.value = Array.from({ length: 6 }, (_, i) => ({
      id: `hot-${i}`,
      name: `热门商品 ${i + 1}`,
      price: Math.floor(Math.random() * 10000) + 1000,
      mainImage: `https://via.placeholder.com/200x200?text=Hot${i + 1}`,
    }));
  }
});

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
    return;
  }
  uni.navigateTo({ url: `/pages/product/list?keyword=${searchKeyword.value}` });
};

const handleBannerClick = (banner: Banner) => {
  if (banner.productId) {
    goToDetail(banner.productId);
  } else if (banner.linkUrl) {
    console.log('Banner link:', banner.linkUrl);
  }
};

const goToIndex = () => {
  // 已经在首页
};

const goToCategory = () => {
  uni.navigateTo({ url: '/pages/product/list' });
};

const goToCart = () => {
  uni.switchTab({ url: '/pages/order/cart' });
};

const goToProfile = () => {
  uni.switchTab({ url: '/pages/user/profile' });
};

const goToDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` });
};

const goToOrders = () => {
  uni.navigateTo({ url: '/pages/order/list' });
};

const goToFavorites = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

const goToService = () => {
  uni.showToast({ title: '客服功能开发中', icon: 'none' });
};
</script>

<style scoped lang="scss">
.container {
  padding-bottom: 60px;
  background: #f8f9ff;
  min-height: 100vh;
}

.top-nav {
  display: flex;
  height: 50px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-item:active {
  background: rgba(84, 129, 99, 0.05);
}

.nav-item.active {
  color: #548163;
  border-bottom: 3px solid #548163;
  font-weight: 600;
}

.search-bar {
  padding: 12px 12px;
  background: white;
  margin: 12px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 8px;
}

input {
  flex: 1;
  height: 36px;
  padding: 0 16px;
  background: #f5f7fa;
  border-radius: 18px;
  font-size: 14px;
  border: none;
  color: #333;
  transition: all 0.3s ease;
}

input:focus {
  background: #f0f2f5;
  outline: none;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

input::placeholder {
  color: #999;
}

button {
  padding: 8px 16px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

button:active {
  opacity: 0.9;
}

.banner {
  width: 100%;
  height: 200px;
  margin: 12px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner image {
  width: 100%;
  height: 100%;
  display: block;
}

.quick-menu {
  display: flex;
  background: white;
  padding: 16px;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.menu-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.menu-item:active {
  opacity: 0.7;
}

.menu-icon {
  font-size: 32px;
}

.menu-text {
  font-size: 12px;
  color: #666;
}

.section {
  margin: 20px 0;
  padding: 0 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-left: 0;
  color: #333;
  display: flex;
  align-items: center;
}

.section-title:before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: #548163;
  border-radius: 2px;
  margin-right: 8px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.product-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.product-item:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.product-item image {
  width: 100%;
  height: 160px;
  display: block;
  background: #f0f0f0;
  object-fit: cover;
}

.product-name {
  font-size: 13px;
  padding: 10px 8px 4px;
  color: #333;
  height: 32px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-weight: 500;
}

.product-price {
  font-size: 14px;
  color: #e74c3c;
  font-weight: bold;
  padding: 0 8px 10px;
}
</style>
