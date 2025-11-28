<template>
  <view class="container">
    <!-- 空购物车状态 -->
    <view v-if="items.length === 0" class="empty">
      <image
        src="/static/images/cart-empty.png"
        mode="aspectFill"
        class="empty-img"
      />
      <text class="empty-text">购物车空空如也~</text>
      <button class="btn-go-shopping" @click="goHome">去购物</button>
    </view>

    <!-- 购物车列表 -->
    <view v-else class="cart-content">
      <!-- 购物车列表 -->
      <scroll-view class="cart-list" scroll-y>
        <!-- 按商家分组展示 -->
        <view
          v-for="sellerGroup in itemsBySeller"
          :key="sellerGroup.sellerId"
          class="seller-group"
        >
          <!-- 商家信息 -->
          <view class="seller-header">
            <view class="seller-name">{{ sellerGroup.sellerName }}</view>
          </view>

          <!-- 商家商品列表 -->
          <view class="seller-items">
            <uni-swipe-action
              v-for="item in sellerGroup.items"
              :key="item.id"
              :right-options="[
                {
                  text: '删除',
                  style: {
                    backgroundColor: '#ff6b6b',
                    color: '#fff',
                    width: '80px',
                    height: '100%',
                    borderRadius: '0',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                },
              ]"
              @click="(event) => onSwipeActionClick(event, item.id)"
            >
              <view class="cart-item">
                <!-- 选择框 -->
                <view class="checkbox-wrapper">
                  <checkbox
                    :checked="item.checked"
                    @click="toggleItem(item.id)"
                    class="custom-checkbox"
                  />
                </view>

                <!-- 商品图片 -->
                <image
                  :src="item.mainImage"
                  mode="aspectFill"
                  class="product-image"
                />

                <!-- 商品信息 -->
                <view class="item-info">
                  <view class="product-name">{{ item.productName }}</view>
                  <view class="spec-info">{{ item.specInfo }}</view>
                  <view class="price-row">
                    <text class="price"
                      >¥{{ (item.price / 100).toFixed(2) }}</text
                    >

                    <!-- 数量控制 -->
                    <view class="quantity-control">
                      <button
                        class="btn-quantity"
                        @click="decreaseQuantity(item.id)"
                      >
                        -
                      </button>
                      <input
                        :value="item.quantity"
                        type="number"
                        readonly
                        class="quantity-input"
                      />
                      <button
                        class="btn-quantity"
                        @click="increaseQuantity(item.id)"
                      >
                        +
                      </button>
                    </view>
                  </view>
                </view>
              </view>
            </uni-swipe-action>
          </view>
        </view>
      </scroll-view>

      <!-- 底部统计栏 -->
      <view class="cart-footer">
        <view class="footer-left">
          <view class="checkbox-wrapper">
            <checkbox
              :checked="isAllChecked"
              @click="toggleAllItems"
              class="custom-checkbox"
            />
          </view>
          <text class="select-all-text">全选</text>
        </view>

        <view class="footer-right">
          <view class="total-section">
            <text class="total-label">合计:</text>
            <text class="total-price"
              >¥{{ (totalPrice / 100).toFixed(2) }}</text
            >
          </view>

          <!-- 结算按钮 -->
          <button class="btn-checkout" @click="checkout">
            结算({{ checkedCount }})
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart";
import { computed, onMounted } from "vue";

const cartStore = useCartStore();

// 页面加载时从本地存储恢复购物车数据
cartStore.restoreFromStorage();

// 页面加载时更新商品库存
onMounted(async () => {
  await cartStore.updateCartStock();
});

interface CartItem {
  id: string;
  productName: string;
  mainImage: string;
  specInfo: string;
  price: number;
  quantity: number;
  checked: boolean;
  productId: string;
  skuId: string;
  stock: number;
}

// 从store获取购物车项目
const items = computed(() => cartStore.items);
const itemsBySeller = computed(() => cartStore.itemsBySeller);
const totalPrice = computed(() => cartStore.totalPrice);
const checkedCount = computed(() => cartStore.checkedCount);
const isAllChecked = computed(() => cartStore.isAllChecked);

const toggleItem = (cartItemId: string) => {
  cartStore.toggleItem(cartItemId);
};

const toggleAllItems = () => {
  cartStore.toggleSelectAll();
};

const increaseQuantity = (cartItemId: string) => {
  const item = items.value.find((i) => i.id === cartItemId);
  if (item) {
    cartStore.updateQuantity(cartItemId, item.quantity + 1);
  }
};

const decreaseQuantity = (cartItemId: string) => {
  const item = items.value.find((i) => i.id === cartItemId);
  if (item && item.quantity > 1) {
    cartStore.updateQuantity(cartItemId, item.quantity - 1);
  }
};

const removeItem = (cartItemId: string) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该商品吗？",
    success: (res) => {
      if (res.confirm) {
        cartStore.removeItem(cartItemId);
      }
    },
  });
};

const checkout = () => {
  if (checkedCount.value === 0) {
    uni.showToast({ title: "请选择商品", icon: "error" });
    return;
  }
  uni.navigateTo({ url: "/pages/order/checkout" });
};

const goHome = () => {
  uni.switchTab({ url: "/pages/index/index" });
};

// 侧滑删除事件处理
const onSwipeActionClick = (event: any, itemId: string) => {
  if (event.content === "删除") {
    removeItem(itemId);
  }
};
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9ff;
  box-sizing: border-box;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: linear-gradient(135deg, #548163, #3d6b52);
  color: white;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(84, 129, 99, 0.3);
  padding: 0 16px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #999;
  padding: 20px;
}

.empty-img {
  width: 140px;
  height: 140px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 20px;
  color: #666;
}

.btn-go-shopping {
  margin-top: 10px;
  padding: 12px 32px;
  background: #548163;
  color: white;
  border-radius: 25px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.3);
  transition: all 0.3s ease;
}

.btn-go-shopping:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 60px;
  align-items: center;
  justify-content: flex-start;
}

.cart-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cart-list::-webkit-scrollbar {
  width: 4px;
}

.cart-list::-webkit-scrollbar-thumb {
  background: rgba(84, 129, 99, 0.3);
  border-radius: 2px;
}

.seller-group {
  width: 100%;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.seller-header {
  padding: 12px 16px;
  background: #f8f9ff;
  border-bottom: 1px solid #f0f0f0;
}

.seller-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.seller-items {
  padding: 8px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 0 0 8px 0;
  background: white;
  border-radius: 8px;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  box-sizing: border-box;
  width: 100%;
}

.cart-item:last-child {
  margin-bottom: 0;
}

.cart-item:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.custom-checkbox {
  transform: scale(1.2);
}

.custom-checkbox .wx-checkbox-input {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: white;
}

.custom-checkbox .wx-checkbox-input.wx-checkbox-input-checked {
  background: #548163;
  border-color: #548163;
}

.custom-checkbox .wx-checkbox-input.wx-checkbox-input-checked::before {
  color: white;
  font-size: 14px;
  transform: scale(1);
  text-align: center;
  line-height: 20px;
}

.product-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background: #f5f5f5;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 70px;
  overflow: hidden;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-align: left;
}

.spec-info {
  font-size: 12px;
  color: #999;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price {
  font-size: 18px;
  font-weight: bold;
  color: #e74c3c;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 4px;
  flex-shrink: 0;
}

.btn-quantity {
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 50%;
  font-size: 16px;
  color: #548163;
  font-weight: bold;
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-quantity:active {
  background: #f0f0f0;
  transform: scale(0.95);
}

.quantity-input {
  width: 38px;
  height: 28px;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-sizing: border-box;
  height: 60px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
}

.select-all-text {
  font-size: 14px;
  color: #333;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.total-section {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #e74c3c;
}

.btn-checkout {
  padding: 8px 20px;
  background: linear-gradient(135deg, #548163, #3d6b52);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-checkout:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}
</style>
