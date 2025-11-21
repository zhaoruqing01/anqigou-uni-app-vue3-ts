<template>
  <view class="product-detail">
    <!-- 商品图片轮播 -->
    <swiper class="product-swiper" :indicator-dots="true" :autoplay="false">
      <swiper-item v-for="(img, index) in product.images" :key="index">
        <image :src="img" mode="aspectFill" class="product-image" />
      </swiper-item>
    </swiper>

    <!-- 商品基本信息 -->
    <view class="product-info">
      <view class="price-section">
        <text class="price">¥{{ (product.price / 100).toFixed(2) }}</text>
        <text class="original-price">¥{{ (product.originalPrice / 100).toFixed(2) }}</text>
      </view>
      <view class="product-name">{{ product.name }}</view>
      <view class="product-desc">{{ product.description }}</view>
    </view>

    <!-- 规格选择 -->
    <view class="spec-section" @click="showSpecModal = true">
      <view class="spec-label">已选</view>
      <view class="spec-value">{{ selectedSpec || '请选择规格' }}</view>
      <text class="arrow">›</text>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-title">商品详情</view>
      <view class="detail-content">
        <rich-text :nodes="product.detailHtml"></rich-text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-buttons">
        <button class="btn-cart" @click="addToCart">加入购物车</button>
        <button class="btn-buy" @click="buyNow">立即购买</button>
      </view>
    </view>

    <!-- 规格选择弹窗 -->
    <view v-if="showSpecModal" class="spec-modal" @click="showSpecModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择规格</text>
          <text class="close-btn" @click="showSpecModal = false">×</text>
        </view>
        <view class="spec-list">
          <view
            v-for="sku in product.skus"
            :key="sku.id"
            class="spec-item"
            :class="{ active: selectedSkuId === sku.id }"
            @click="selectSku(sku)"
          >
            <text>{{ sku.specValue }}</text>
            <text class="spec-price">¥{{ (sku.price / 100).toFixed(2) }}</text>
          </view>
        </view>
        <view class="quantity-section">
          <text class="quantity-label">数量</text>
          <view class="quantity-control">
            <button @click="decreaseQuantity">-</button>
            <input v-model.number="quantity" type="number" />
            <button @click="increaseQuantity">+</button>
          </view>
        </view>
        <button class="btn-confirm" @click="confirmSpec">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { onMounted, ref } from 'vue';

interface ProductSku {
  id: string;
  specValue: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  detailHtml: string;
  skus: ProductSku[];
}

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

const showSpecModal = ref(false);
const selectedSkuId = ref('');
const selectedSpec = ref('');
const quantity = ref(1);

const getProductId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.id || '';
};

onMounted(async () => {
  const productId = getProductId();
  if (productId) {
    await fetchProductDetail(productId);
  }
});

const fetchProductDetail = async (productId: string) => {
  try {
    // TODO: 调用API获取商品详情
    // 模拟数据
    product.value = {
      id: productId,
      name: '示例商品',
      description: '这是一个示例商品描述',
      price: 9999,
      originalPrice: 12999,
      images: [
        'https://via.placeholder.com/375x375?text=Image1',
        'https://via.placeholder.com/375x375?text=Image2',
        'https://via.placeholder.com/375x375?text=Image3',
      ],
      detailHtml: '<p>商品详情内容</p>',
      skus: [
        { id: '1', specValue: '红色 S', price: 9999, stock: 100 },
        { id: '2', specValue: '红色 M', price: 9999, stock: 100 },
        { id: '3', specValue: '蓝色 S', price: 10999, stock: 50 },
      ],
    };
  } catch (error) {
    uni.showToast({ title: '获取商品详情失败', icon: 'error' });
  }
};

const selectSku = (sku: ProductSku) => {
  selectedSkuId.value = sku.id;
  selectedSpec.value = sku.specValue;
  product.value.price = sku.price;
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const confirmSpec = () => {
  if (!selectedSkuId.value) {
    uni.showToast({ title: '请选择规格', icon: 'none' });
    return;
  }
  showSpecModal.value = false;
};

const addToCart = () => {
  if (!selectedSkuId.value) {
    showSpecModal.value = true;
    return;
  }

  cartStore.addItem({
    id: Date.now().toString(),
    productId: product.value.id,
    productName: product.value.name,
    price: product.value.price,
    mainImage: product.value.images[0],
    skuId: selectedSkuId.value,
    specInfo: selectedSpec.value,
    quantity: quantity.value,
    checked: true,
  });

  uni.showToast({ title: '已加入购物车', icon: 'success' });
};

const buyNow = () => {
  if (!selectedSkuId.value) {
    showSpecModal.value = true;
    return;
  }

  addToCart();
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/order/checkout' });
  }, 500);
};
</script>

<style scoped lang="scss">
.product-detail {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 80px;
}

.product-swiper {
  width: 100%;
  height: 375px;
  background: white;
}

.product-swiper .product-image {
  width: 100%;
  height: 100%;
}

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

.product-info .product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-info .product-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.spec-section {
  display: flex;
  align-items: center;
  background: white;
  padding: 14px 16px;
  margin-bottom: 10px;
  cursor: pointer;
}

.spec-section:active {
  background: #f5f5f5;
}

.spec-label {
  font-size: 14px;
  color: #666;
  margin-right: 12px;
}

.spec-value {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.arrow {
  font-size: 20px;
  color: #999;
}

.detail-section {
  background: white;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.detail-content {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 10px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 12px;
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

.spec-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-content {
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 28px;
  color: #999;
  cursor: pointer;
}

.spec-list {
  margin-bottom: 20px;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
}

.spec-item.active {
  border-color: #548163;
  background: #f8f9ff;
}

.spec-price {
  color: #e74c3c;
  font-weight: 600;
}

.quantity-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.quantity-label {
  font-size: 14px;
  color: #333;
}

.quantity-control {
  display: flex;
  gap: 8px;
}

.quantity-control button {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 16px;
}

.quantity-control input {
  width: 50px;
  height: 32px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
}
</style>
