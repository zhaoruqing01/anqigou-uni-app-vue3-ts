<template>
  <view class="product-detail">
    <!-- 商品图片轮播 -->
    <swiper
      class="product-swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :circular="true"
    >
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image :src="img" mode="aspectFill" class="product-image" @click="previewImage(index)" />
      </swiper-item>
    </swiper>

    <!-- 商品基本信息 -->
    <view class="product-info">
      <view class="price-section">
        <text class="price">¥{{ (product.price / 100).toFixed(2) }}</text>
        <text class="original-price" v-if="product.originalPrice > product.price">
          ¥{{ (product.originalPrice / 100).toFixed(2) }}
        </text>
      </view>
      <view class="product-name">{{ product.name }}</view>
      <view class="product-desc">{{ product.description }}</view>
      <view class="product-stock" v-if="selectedSku">
        <text class="stock-text" :class="{ 'out-of-stock': selectedSku.stock <= 0 }">
          {{ selectedSku.stock > 0 ? `库存：${selectedSku.stock}件` : '缺货' }}
        </text>
      </view>
      <view class="product-sales">
        <text>已售 {{ product.salesCount || 0 }} 件</text>
      </view>
    </view>

    <!-- 规格选择 - 仅显示已选结果，点击打开GeekSku弹窗 -->
    <view class="spec-section">
      <view class="spec-selector" @click="handleSkuShow">
        <text class="label">已选</text>
        <view class="selected-specs">
          <text v-if="Object.keys(selectedSpecs).length === 0" class="placeholder">请选择规格</text>
          <text v-else>{{ Object.values(selectedSpecs).join(', ') }}</text>
        </view>
        <uni-icons type="arrowright" size="14" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-title">商品详情</view>
      <view>
        <scroll-view scroll-y class="detail-content">
          <!-- 排列图片 -->
          <view class="detail-image" v-for="(img, index) in product.images" :key="index">
            <image :src="img" mode="aspectFill" class="detail-image-item" />
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- geek-sku组件（全权处理规格选择，废弃本地重复逻辑） -->
    <GeekSku
      v-model="showSkuModal"
      :data="geekSkuData"
      :defaultCover="product.images?.[0] || ''"
      :defaultNum="quantity"
      :themeColor="[84, 129, 99]"
      @skuChange="onSkuChange"
      @confirm="onSkuConfirm"
      @numChange="quantity = $event"
      :disabled="!geekSkuData.length"
    />

    <HotProduct />

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-buttons">
        <!-- 收藏 -->
        <view class="btn-favorite" @click="handleFavorite">
          <uni-icons type="heart" size="30" v-if="!isFavorite"></uni-icons>
          <uni-icons type="heart-filled" size="30" color="#e85748" v-else></uni-icons>
          <view class="favorite-label">{{ isFavorite ? '已收藏' : '收藏' }}</view>
        </view>
        <button class="btn-cart" @click="addToCart">加入购物车</button>
        <button class="btn-buy" @click="buyNow">立即购买</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { addFavorite, cancelFavorite, checkFavorite } from '@/api/favorite';
import HotProduct from '@/components/hot-product/index.vue';
import { useCartStore } from '@/stores/cart';
import GeekSku from '@/uni_modules/geek-sku/components/geek-sku/geek-sku.vue';
import request from '@/utils/request';
import { computed, onMounted, ref } from 'vue';

// 定义类型接口
interface ProductSku {
  id: string;
  specValue: string;
  specValueJson: Record<string, string>; // 明确为键值对格式
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // 初始为默认价格，选中SKU后更新
  originalPrice: number;
  images: string[];
  detailHtml: string;
  skus: ProductSku[];
  salesCount?: number;
}

// 全局状态
const cartStore = useCartStore();
const product = ref<Product>({
  id: '',
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  images: [],
  detailHtml: '',
  skus: [],
});

// SKU相关状态（仅用于显示，由GeekSku组件同步）
const showSkuModal = ref(false);
const selectedSpecs = ref<Record<string, string>>({}); // 已选规格（键：规格名，值：规格值）
const selectedSku = ref<ProductSku | null>(null); // 选中的SKU
const quantity = ref(1); // 购买数量
const maxQuantity = ref(1); // 最大购买数量（=选中SKU的库存）
const isFavorite = ref<boolean>(false); // 收藏icon

// 获取页面路由参数（商品ID）
const getProductId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.id || '';
};

// 页面加载时获取商品详情
onMounted(async () => {
  const productId = getProductId();
  if (productId) {
    await fetchProductDetail(productId);
    await checkFavoriteStatus(productId);
  }
});

// 检测当前商品是否已被收藏
const checkFavoriteStatus = async (productId: string) => {
  try {
    const res = await checkFavorite(productId);
    // @ts-ignore
    if (res.code === 0) {
      isFavorite.value = res.data;
    }
  } catch (error) {
    console.error('检测收藏状态失败:', error);
  }
};

// 请求商品详情数据
const fetchProductDetail = async (productId: string) => {
  try {
    const response: any = await request.get(`/api/product/${productId}`);
    if (response.code === 0) {
      const data = response.data;
      product.value = data;
      console.log(product.value, 'product');

      // 初始化默认价格（取第一个SKU的价格，无SKU则用商品默认价格）
      if (data.skus?.length) {
        product.value.price = data.skus[0].price;
        maxQuantity.value = data.skus[0].stock;
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    uni.showToast({ title: '获取商品详情失败', icon: 'error' });
  }
};

// 转换为GeekSku组件所需格式（关键修复：透传原始规格键值对，不硬编码）
const geekSkuData = computed(() => {
  const skus = product.value.skus || [];
  if (!skus.length) return [];

  return skus.map((sku) => {
    let skuAttrs: Record<string, string> = {};
    if (sku.specValueJson) {
      skuAttrs =
        typeof sku.specValueJson === 'string' ? JSON.parse(sku.specValueJson) : sku.specValueJson;
    } else if (sku.specValue) {
      const specs = sku.specValue.split(',');
      const specNames = ['颜色', '尺码'];
      specs.forEach((spec, index) => {
        if (specNames[index] && spec) {
          skuAttrs[specNames[index]] = spec;
        }
      });
    }

    return {
      id: sku.id,
      price: sku.price,
      stock: sku.stock,
      sku_attrs: skuAttrs, // 透传原始规格，GeekSku自动识别分组
    };
  });
});

// GeekSku规格变化时同步状态（选中/取消选中）
const onSkuChange = (sku: any) => {
  if (sku && sku.id) {
    // 同步选中的SKU信息
    selectedSku.value = {
      id: sku.id,
      specValue: Object.values(sku.sku_attrs).join(','),
      specValueJson: sku.sku_attrs,
      price: sku.price,
      stock: sku.stock,
    };
    // 更新商品显示价格和最大库存
    product.value.price = sku.price;
    maxQuantity.value = sku.stock;
    // 同步已选规格（用于页面显示）
    selectedSpecs.value = { ...sku.sku_attrs };
    // 确保数量不超过库存
    if (quantity.value > sku.stock) {
      quantity.value = sku.stock;
    }
  } else {
    // 未选中任何SKU时重置状态
    selectedSku.value = null;
    selectedSpecs.value = {};
    product.value.price = product.value.originalPrice || 0;
    maxQuantity.value = 1;
  }
};

// GeekSku确认选择时触发（关闭弹窗，保持状态同步）
const onSkuConfirm = (e: any) => {
  showSkuModal.value = false;
  if (e.sku && e.sku.id) {
    selectedSku.value = {
      id: e.sku.id,
      specValue: Object.values(e.sku.sku_attrs).join(','),
      specValueJson: e.sku.sku_attrs,
      price: e.sku.price,
      stock: e.sku.stock,
    };
    product.value.price = e.sku.price;
    maxQuantity.value = e.sku.stock;
    selectedSpecs.value = { ...e.sku.sku_attrs };
    quantity.value = e.num; // 同步选择的数量
  }
};

// 加入购物车
const addToCart = async () => {
  if (!selectedSku.value) {
    showSkuModal.value = true; // 未选规格，打开选择弹窗
    return;
  }
  if (selectedSku.value.stock <= 0) {
    uni.showToast({ title: '该规格暂无库存', icon: 'none' });
    return;
  }
  if (quantity.value <= 0) {
    uni.showToast({ title: '请选择购买数量', icon: 'none' });
    return;
  }

  // 加入购物车（复用原有逻辑）
  await cartStore.addItem({
    id: Date.now().toString(),
    productId: product.value.id,
    productName: product.value.name,
    price: product.value.price,
    mainImage: product.value.images[0] || '',
    skuId: selectedSku.value.id,
    specInfo: Object.values(selectedSpecs.value).join(', '),
    quantity: quantity.value,
    checked: true,
    sellerId: 'default',
    sellerName: '默认商家',
    stock: selectedSku.value.stock,
  });

  uni.showToast({ title: '已加入购物车', icon: 'success' });
};

// 立即购买
const buyNow = async () => {
  if (!selectedSku.value) {
    showSkuModal.value = true; // 未选规格，打开选择弹窗
    return;
  }
  if (selectedSku.value.stock <= 0) {
    uni.showToast({ title: '该规格暂无库存', icon: 'none' });
    return;
  }

  // 先加入购物车，再跳结算页（复用原有逻辑）
  await addToCart();
  console.log(cartStore.items, 'cartStore.items');

  setTimeout(() => {
    uni.navigateTo({ url: '/pages/order/checkout' });
  }, 500);
};

// 图片预览
const previewImage = (index: number) => {
  if (!product.value.images.length) return;
  uni.previewImage({
    current: index,
    urls: product.value.images,
  });
};

// 控制sku组件的显示和隐藏
const handleSkuShow = () => {
  showSkuModal.value = true;
};

const handleFavorite = async () => {
  isFavorite.value = !isFavorite.value;
  if (isFavorite.value) {
    const res = await addFavorite(product.value.id);
    // @ts-ignore
    if (res.code === 0) {
      uni.showToast({ title: '收藏成功', icon: 'success' });
    } else {
      uni.showToast({ title: '收藏失败', icon: 'error' });
    }
  } else {
    const res = await cancelFavorite(product.value.id);
    // @ts-ignore
    if (res.code === 0) {
      uni.showToast({ title: '取消收藏成功', icon: 'success' });
    } else {
      uni.showToast({ title: '取消收藏失败', icon: 'error' });
    }
  }
};
</script>

<style scoped lang="scss">
.product-detail {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px; // 给底部栏留空间
}

/* 轮播图样式 */
.product-swiper {
  width: 100%;
  height: 375px;
  background: white;
}
.product-swiper .product-image {
  width: 100%;
  height: 100%;
}

/* 商品信息样式 */
.product-info {
  background: white;
  padding: 16px;
  margin-bottom: 10px;
}
.price-section {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}
.price-section .price {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
}
.price-section .original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}
.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}
.product-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 8px;
}
.product-stock {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}
.stock-text.out-of-stock {
  color: #e74c3c; // 缺货红色
}
.product-sales {
  font-size: 13px;
  color: #999;
}

/* 规格选择区域样式 */
.spec-section {
  background: white;
  padding: 14px 16px;
  margin-bottom: 10px;
}
.spec-selector {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.spec-selector .label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.selected-specs {
  flex: 1;
  font-size: 28rpx;
  color: #666;
}
.selected-specs .placeholder {
  color: #999;
}

/* 商品详情样式 */
.detail-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 16px;
  margin-bottom: 10px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  width: 100%;
  height: 40px;
  line-height: 40px;
}
.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}
/* 修复rich-text图片溢出问题 */
.detail-content img {
  max-width: 100% !important;
  height: auto !important;
}

/* 底部操作栏样式 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 10px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.btn-favorite {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .favorite-label {
    font-size: 12px;
  }
}
.active {
  background: red;
}
.action-buttons button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cart {
  background: #ff9500;
  color: white;
}
.btn-buy {
  background: #548163;
  color: white;
}

/* 解决uni-icons垂直居中问题 */
.uni-icons {
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-image {
  width: 100%;
  height: 100%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
