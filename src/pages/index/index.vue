<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar" @click="handleSearch">
      <view class="search-icon">🔍 &nbsp; 搜索商品</view>
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
      <view class="menu-item">
        <button open-type="contact" class="contact-btn"></button>
        <view class="menu-icon">💬</view>
        <view class="menu-text">客服</view>
      </view>
    </view>

    <!-- 爆款推荐 -->
    <view class="hot-recommend">
      <view class="section">
        <view class="section-title">爆款推荐</view>
        <view class="product-grid-recommend">
          <view class="img-container">
            <image :src="hotProducts[8].mainImage" mode="aspectFill" />
          </view>
          <view class="img-container">
            <image :src="hotProducts[5].mainImage" mode="aspectFill" />
          </view>
        </view>
      </view>
    </view>
    <!-- 热门商品 -->
    <HotProduct />
  </view>
</template>

<script setup lang="ts">
import { getHotProducts } from '@/api/product';
import HotProduct from '@/components/hot-product/index.vue';
import { onReachBottom } from '@dcloudio/uni-app';
import { onMounted, ref } from 'vue';

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  productId?: string;
}

const isLoading = ref(false);
const hotProducts = ref<any[]>([]);
const banners = ref<Banner[]>([
  {
    id: '1',
    imageUrl: 'https://img.shetu66.com/2023/10/18/1697618323357921.png',
  },
  {
    id: '2',
    imageUrl: 'https://img.shetu66.com/2023/10/18/1697617454290302.png',
  },
  {
    id: '3',
    imageUrl: 'https://img.shetu66.com/2023/10/18/1697578751828707.png',
  },
]);

// 触底加载
onReachBottom(() => {
  const params = hotProducts.value.length + 10;
  getHotList(params);
});

// 获取hot数据
const getHotList = async (params: number) => {
  isLoading.value = true;
  const res = await getHotProducts(params);
  if (res.data && res.data.length > 0) {
    hotProducts.value = res.data;
    isLoading.value = false;
  } else {
    // 模拟数据
    hotProducts.value = Array.from({ length: 6 }, (_, i) => ({
      id: `hot-${i}`,
      name: `热门商品 ${i + 1}`,
      price: Math.floor(Math.random() * 10000) + 1000,
      mainImage: `https://via.placeholder.com/200x200?text=Hot${i + 1}`,
    }));
  }
};
onMounted(async () => {
  try {
    getHotList(10);
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
  uni.navigateTo({ url: '/pages/product/search-view' });
};

const handleBannerClick = (banner: Banner) => {
  if (banner.productId) {
    goToDetail(banner.productId);
  } else if (banner.linkUrl) {
    console.log('Banner link:', banner.linkUrl);
  }
};

const goToCategory = () => {
  uni.switchTab({ url: '/pages/product/list' });
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
  uni.navigateTo({ url: '/pages/user/favorite' });
};

// 配置页面转发
defineOptions({
  onShareAppMessage: (res) => {
    return {
      title: '首页',
      path: `/pages/index/index`,
      success: () => {
        uni.showToast({ title: '转发成功', icon: 'success' });
      },
      fail: () => {
        uni.showToast({ title: '转发失败', icon: 'none' });
      },
    };
  },
});
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 60px;
}

// 搜索栏
.search-bar {
  padding: $spacing-md;
  cursor: pointer;
  transition: all $transition-base;

  &:active {
    opacity: 0.8;
  }

  .search-icon {
    @include flex-align-center;
    height: 44px;
    padding: 0 $spacing-lg;
    background: $white;
    border-radius: $radius-xl;
    box-shadow: $shadow-sm;
    font-size: $font-md;
    color: $text-tertiary;
    transition: all $transition-base;

    &:active {
      background: $bg-hover;
    }
  }
}

// 轮播图
.banner {
  width: calc(100% - 24px);
  height: 160px;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-md;

  image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
}

// 快捷菜单
.quick-menu {
  display: flex;
  background: $white;
  padding: $spacing-xl 0;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
}

.menu-item {
  @include flex-center;
  flex: 1;
  flex-direction: column;
  gap: $spacing-sm;
  position: relative;
  cursor: pointer;
  transition: all $transition-base;

  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  .contact-btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}

.menu-icon {
  font-size: 36px;
  line-height: 1;
}

.menu-text {
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: $font-medium;
}

// 爆款推荐
.product-grid-recommend {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  .img-container {
    border-radius: $radius-md;
    overflow: hidden;
    box-shadow: $shadow-sm;
    width: 95%;
    height: 180px;
  }
}

// 商品区域
.section {
  margin: $spacing-xl 0;
  padding: 0 $spacing-md;
}

.section-title {
  @include flex-align-center;
  font-size: $font-lg;
  font-weight: $font-semibold;
  margin-bottom: $spacing-md;
  color: $text-primary;

  &:before {
    content: '';
    width: 4px;
    height: 20px;
    background: $gradient-primary;
    border-radius: 2px;
    margin-right: $spacing-sm;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.product-item {
  @include card;
  @include card-hover;
  padding: 0;
  cursor: pointer;
  @include fade-in;

  image {
    width: 100%;
    height: 170px;
    display: block;
    background: $bg-secondary;
    object-fit: cover;
  }
}

.product-name {
  @include multi-ellipsis(2);
  font-size: $font-sm;
  padding: $spacing-md $spacing-sm $spacing-xs;
  color: $text-primary;
  height: 36px;
  line-height: 1.4;
  font-weight: $font-medium;
}

.product-price {
  font-size: $font-lg;
  color: $error-color;
  font-weight: $font-bold;
  padding: 0 $spacing-sm $spacing-md;

  &::before {
    content: '¥';
    font-size: 0.8em;
    margin-right: 2px;
  }
}

// 加载更多
.load-more {
  @include flex-center;
  padding: $spacing-lg 0;
  font-size: $font-sm;
  color: $text-tertiary;
}
</style>
