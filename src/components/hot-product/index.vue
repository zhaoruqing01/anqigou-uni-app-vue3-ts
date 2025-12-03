<template>
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
  <view class="load-more">{{ isLoading ? '加载中...' : '到底啦~' }}</view>
</template>
<script setup lang="ts">
import { getHotProducts } from '@/api/product';
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

const goToDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` });
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';
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
