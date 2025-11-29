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
        <image
          :src="img"
          mode="aspectFill"
          class="product-image"
          @click="previewImage(index)"
        />
      </swiper-item>
    </swiper>

    <!-- 商品基本信息 -->
    <view class="product-info">
      <view class="price-section">
        <text class="price">¥{{ (product.price / 100).toFixed(2) }}</text>
        <text
          class="original-price"
          v-if="product.originalPrice > product.price"
          >¥{{ (product.originalPrice / 100).toFixed(2) }}</text
        >
      </view>
      <view class="product-name">{{ product.name }}</view>
      <view class="product-desc">{{ product.description }}</view>
      <view class="product-stock" v-if="selectedSku">
        <text
          class="stock-text"
          :class="{ 'out-of-stock': selectedSku.stock <= 0 }"
        >
          {{ selectedSku.stock > 0 ? `库存：${selectedSku.stock}件` : "缺货" }}
        </text>
      </view>
      <view class="product-sales">
        <text>已售 {{ product.salesCount || 0 }} 件</text>
      </view>
    </view>

    <!-- 规格选择 -->
    <view class="spec-section">
      <view
        v-for="(specGroup, groupIndex) in specGroups"
        :key="groupIndex"
        class="spec-group"
      >
        <view class="spec-group-title">{{ specGroup.name }} *</view>
        <scroll-view scroll-x class="spec-options">
          <view
            v-for="option in specGroup.options"
            :key="option.value"
            class="spec-option"
            :class="{
              active: selectedSpecs[specGroup.name] === option.value,
              disabled: !option.available,
            }"
            @click="selectSpec(specGroup.name, option)"
          >
            <text>{{ option.value }}</text>
          </view>
        </scroll-view>
      </view>
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

    <!-- 数量选择弹窗 -->
    <view
      v-if="showQuantityModal"
      class="spec-modal"
      @click="showQuantityModal = false"
    >
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择数量</text>
          <text class="close-btn" @click="showQuantityModal = false">×</text>
        </view>
        <view class="quantity-section">
          <text class="quantity-label">数量</text>
          <view class="quantity-control">
            <button @click="decreaseQuantity" :disabled="quantity <= 1">
              -
            </button>
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              :max="maxQuantity"
            />
            <button
              @click="increaseQuantity"
              :disabled="quantity >= maxQuantity"
            >
              +
            </button>
          </view>
        </view>
        <button class="btn-confirm" @click="confirmQuantity">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import request from "@/utils/request";
import { computed, onMounted, ref, watch } from "vue";

interface ProductSku {
  id: string;
  specValue: string;
  specValueJson: any;
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
  salesCount?: number;
}

interface SpecOption {
  value: string;
  available: boolean;
}

interface SpecGroup {
  name: string;
  options: SpecOption[];
}

const cartStore = useCartStore();
const product = ref<Product>({
  id: "",
  name: "",
  description: "",
  price: 0,
  originalPrice: 0,
  images: [],
  detailHtml: "",
  skus: [],
});

const showQuantityModal = ref(false);
const selectedSpecs = ref<Record<string, string>>({});
const quantity = ref(1);
const maxQuantity = ref(1);

// 规格分组
const specGroups = ref<SpecGroup[]>([]);
const selectedSku = ref<ProductSku | null>(null);

const getProductId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.id || "";
};

onMounted(async () => {
  const productId = getProductId();
  if (productId) {
    await fetchProductDetail(productId);
  }
});

const fetchProductDetail = async (productId: string) => {
  try {
    const response = await request.get(`/product/${productId}`);
    if (response.code === 200) {
      product.value = response.data;
      // 解析规格分组
      parseSpecGroups();
    }
  } catch (error) {
    console.error("获取商品详情失败:", error);
    uni.showToast({ title: "获取商品详情失败", icon: "error" });
  }
};

// 解析规格分组
const parseSpecGroups = () => {
  if (!product.value.skus || product.value.skus.length === 0) return;

  // 提取所有规格名称和值
  const specMap = new Map<string, Set<string>>();

  product.value.skus.forEach((sku) => {
    try {
      const specValueJson =
        typeof sku.specValueJson === "string"
          ? JSON.parse(sku.specValueJson)
          : sku.specValueJson;
      for (const [key, value] of Object.entries(specValueJson)) {
        if (!specMap.has(key)) {
          specMap.set(key, new Set<string>());
        }
        specMap.get(key)?.add(value as string);
      }
    } catch (e) {
      console.error("解析规格JSON失败:", e);
    }
  });

  // 转换为规格分组
  const groups: SpecGroup[] = [];
  specMap.forEach((values, name) => {
    groups.push({
      name,
      options: Array.from(values).map((value) => ({
        value,
        available: true,
      })),
    });
  });

  specGroups.value = groups;
};

// 监听规格选择变化，更新选中的SKU
watch(
  selectedSpecs,
  () => {
    updateSelectedSku();
  },
  { deep: true }
);

// 更新选中的SKU
const updateSelectedSku = () => {
  if (!product.value.skus || product.value.skus.length === 0) return;

  // 查找匹配的SKU
  const matchingSku = product.value.skus.find((sku) => {
    try {
      const specValueJson =
        typeof sku.specValueJson === "string"
          ? JSON.parse(sku.specValueJson)
          : sku.specValueJson;
      // 检查所有选中的规格是否匹配
      for (const [key, value] of Object.entries(selectedSpecs.value)) {
        if (specValueJson[key] !== value) {
          return false;
        }
      }
      // 检查所有规格是否都已选择
      const specValueKeys = Object.keys(
        typeof sku.specValueJson === "string"
          ? JSON.parse(sku.specValueJson)
          : sku.specValueJson
      );
      const selectedKeys = Object.keys(selectedSpecs.value);
      return specValueKeys.length === selectedKeys.length;
    } catch (e) {
      console.error("匹配SKU失败:", e);
      return false;
    }
  });

  selectedSku.value = matchingSku || null;

  if (matchingSku) {
    product.value.price = matchingSku.price;
    maxQuantity.value = matchingSku.stock;
    // 确保数量不超过库存
    if (quantity.value > matchingSku.stock) {
      quantity.value = matchingSku.stock;
    }
  }
};

// 选择规格
const selectSpec = (specName: string, option: SpecOption) => {
  if (!option.available) {
    uni.showToast({ title: "该规格暂无库存", icon: "none" });
    return;
  }

  selectedSpecs.value[specName] = option.value;
};

// 检查规格是否已选择完整
const isSpecSelectedComplete = computed(() => {
  return specGroups.value.length === Object.keys(selectedSpecs.value).length;
});

const increaseQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++;
  }
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const confirmQuantity = () => {
  showQuantityModal.value = false;
};

const addToCart = () => {
  if (!isSpecSelectedComplete.value) {
    uni.showToast({ title: "请选择完整商品规格", icon: "none" });
    return;
  }

  if (!selectedSku.value || selectedSku.value.stock <= 0) {
    uni.showToast({ title: "该规格暂无库存", icon: "none" });
    return;
  }

  cartStore.addItem({
    id: Date.now().toString(),
    productId: product.value.id,
    productName: product.value.name,
    price: product.value.price,
    mainImage: product.value.images[0],
    skuId: selectedSku.value.id,
    specInfo: JSON.stringify(selectedSpecs.value),
    quantity: quantity.value,
    checked: true,
  });

  uni.showToast({ title: "已加入购物车", icon: "success" });
};

const buyNow = () => {
  if (!isSpecSelectedComplete.value) {
    uni.showToast({ title: "请选择完整商品规格", icon: "none" });
    return;
  }

  if (!selectedSku.value || selectedSku.value.stock <= 0) {
    uni.showToast({ title: "该规格暂无库存", icon: "none" });
    return;
  }

  addToCart();
  setTimeout(() => {
    uni.navigateTo({ url: "/pages/order/checkout" });
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
  margin-bottom: 8px;
}

.product-stock {
  font-size: 13px;
  color: #666;
}

.stock-text {
  color: #4caf50;
}

.spec-section {
  background: white;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.spec-group {
  margin-bottom: 16px;
}

.spec-group:last-child {
  margin-bottom: 0;
}

.spec-group-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 500;
}

.spec-options {
  display: flex;
  gap: 10px;
  padding-bottom: 5px;
}

.spec-option {
  padding: 8px 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.spec-option:active {
  background: rgba(84, 129, 99, 0.05);
}

.spec-option.active {
  background: #548163;
  color: white;
  border-color: #548163;
}

.spec-option.disabled {
  background: #f5f5f5;
  color: #999;
  border-color: #e0e0e0;
  cursor: not-allowed;
  opacity: 0.6;
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
