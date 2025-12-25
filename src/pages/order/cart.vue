<template>
  <view class="container">
    <!-- 空购物车状态 -->
    <view v-if="items.length === 0" class="empty">
      <image src="/static/images/cart-empty.png" mode="aspectFill" class="empty-img" />
      <text class="empty-text">购物车空空如也~</text>
      <button class="btn-go-shopping" @click="goHome">去购物</button>
      <!-- 热门商品 -->
      <HotProduct />
    </view>

    <!-- 购物车列表 -->
    <view v-else class="cart-content">
      <!-- 购物车列表 -->
      <scroll-view class="cart-list" scroll-y>
        <!-- 按商家分组展示 -->
        <view v-for="sellerGroup in itemsBySeller" :key="sellerGroup.sellerId" class="seller-group">
          <!-- 商家信息 -->
          <view class="seller-header">
            <view class="seller-name">{{ sellerGroup.sellerName }}</view>
          </view>

          <!-- 商家商品列表 -->
          <view class="seller-items">
            <uni-swipe-action>
              <uni-swipe-action-item
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
                      color="#548163"
                    />
                  </view>

                  <!-- 商品图片 -->
                  <image :src="item.mainImage" mode="aspectFill" class="product-image" />

                  <!-- 商品信息 -->
                  <view class="item-info">
                    <view class="product-name">{{ item.productName }}</view>
                    <view class="spec-info">{{ item.specInfo }}</view>
                    <view class="price-row">
                      <text class="price">¥{{ (item.price / 100).toFixed(2) }}</text>

                      <!-- 数量控制 -->
                      <view class="quantity-control">
                        <button class="btn-quantity" @click="decreaseQuantity(item.id)">-</button>
                        <input
                          :value="item.quantity"
                          type="number"
                          readonly
                          class="quantity-input"
                        />
                        <button class="btn-quantity" @click="increaseQuantity(item.id)">+</button>
                      </view>
                    </view>
                  </view>
                </view>
              </uni-swipe-action-item>
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
              color="#548163"
            />
          </view>
          <text class="select-all-text">全选</text>
        </view>

        <view class="footer-right">
          <view class="total-section">
            <text class="total-label">合计:</text>
            <text class="total-price">¥{{ (totalPrice / 100).toFixed(2) }}</text>
          </view>

          <!-- 结算按钮 -->
          <button class="btn-checkout" @click="checkout">结算({{ checkedCount }})</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import HotProduct from '@/components/hot-product/index.vue';
import { useCartStore } from '@/stores/cart';
import { onShow } from '@dcloudio/uni-app';
import { computed } from 'vue';

const cartStore = useCartStore();

// 页面加载时从本地存储恢复购物车数据
cartStore.restoreFromStorage();

// 页面加载时更新商品库存
onShow(async () => {
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
    title: '提示',
    content: '确定要删除该商品吗？',
    confirmColor: '#548163',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeItem(cartItemId);
      }
    },
  });
};

const checkout = () => {
  if (checkedCount.value === 0) {
    uni.showToast({ title: '请选择商品', icon: 'error' });
    return;
  }
  uni.navigateTo({ url: '/pages/order/checkout' });
};

const goHome = () => {
  uni.switchTab({ url: '/pages/index/index' });
};

// 侧滑删除事件处理
const onSwipeActionClick = (event: any, itemId: string) => {
  if (event.content.text === '删除') {
    removeItem(itemId);
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  min-height: 100vh;
  background: $bg-color;
  padding: 8px 8px;
  width: 100%;
  box-sizing: border-box;
}

// 空购物车状态
.empty {
  @include flex-center;
  flex-direction: column;
  flex: 1;
  // padding: $spacing-xxxl;
  @include fade-in;

  .empty-img {
    width: 150px;
    height: 150px;
    margin-bottom: $spacing-lg;
    opacity: 0.6;
  }

  .empty-text {
    font-size: $font-lg;
    color: $text-tertiary;
    margin-bottom: $spacing-xl;
  }

  .btn-go-shopping {
    @include btn-primary;
    margin-top: $spacing-md;
  }
}

// 购物车内容
.cart-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  padding-bottom: 70px;
  box-sizing: border-box;
}

.cart-list {
  flex: 1;
  width: 100%;
  padding: $spacing-md;
  overflow-y: auto;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($primary-color, 0.3);
    border-radius: 2px;
  }
}

// 商家分组
.seller-group {
  @include card;
  padding: 0;
  margin-bottom: $spacing-md;
  overflow: hidden;
  @include slide-up;
  width: 100%;
  box-sizing: border-box;

  .seller-header {
    padding: $spacing-md $spacing-lg;
    background: $bg-secondary;
    border-bottom: 1px solid $border-light;

    .seller-name {
      font-size: $font-base;
      font-weight: $font-semibold;
      color: $text-primary;
    }
  }

  .seller-items {
    padding: $spacing-sm;
  }
}

.seller-items {
  padding: $spacing-sm;
  width: 100%;
  box-sizing: border-box;
}

// 购物车商品项
.cart-item {
  @include flex-align-center;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  background: $white;
  border-radius: $radius-sm;
  gap: $spacing-md;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all $transition-base;
  width: 100%;
  box-sizing: border-box;

  &:last-child {
    margin-bottom: 0;
  }

  &:active {
    box-shadow: $shadow-sm;
    transform: translateY(-1px);
  }

  .checkbox-wrapper {
    @include flex-center;
    flex-shrink: 0;

    .custom-checkbox {
      transform: scale(1.2);

      .wx-checkbox-input {
        width: 20px;
        height: 20px;
        border-radius: $radius-round;
        border: 2px solid $border-color;
        background: $white;
      }

      .wx-checkbox-input.wx-checkbox-input-checked {
        background: $primary-color;
        border-color: $primary-color;

        &::before {
          color: $white;
          font-size: $font-sm;
          transform: scale(1);
          text-align: center;
          line-height: 20px;
        }
      }
    }
  }

  .product-image {
    width: 75px;
    height: 75px;
    border-radius: $radius-sm;
    background: $bg-secondary;
    object-fit: cover;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    min-height: 75px;
    align-items: flex-start;
    min-width: 0; // 允许在flex容器中正确收缩

    .product-name {
      @include multi-ellipsis(2);
      font-size: $font-base;
      font-weight: $font-medium;
      color: $text-primary;
      line-height: 1.4;
      width: 100%;
    }

    .spec-info {
      @include ellipsis;
      font-size: $font-sm;
      color: $text-tertiary;
      width: 100%;
    }

    .price-row {
      @include flex-between;
      width: 100%;
      margin-top: auto;
      min-width: 0; // 允许在flex容器中正确收缩

      .price {
        font-size: $font-lg;
        font-weight: $font-bold;
        color: $error-color;
        flex-shrink: 1; // 允许价格文本适当收缩
        min-width: 80px; // 确保价格显示的基本宽度
      }
    }
  }
}

// 数量控制
.quantity-control {
  @include flex-align-center;
  gap: $spacing-sm;
  background: $bg-secondary;
  border-radius: $radius-xl;
  padding: 4px;
  flex-shrink: 0;
  min-width: 120px; // 确保在小屏幕上也有足够宽度

  .btn-quantity {
    @include flex-center;
    width: 32px;
    height: 32px;
    border: none;
    background: $white;
    border-radius: $radius-round;
    font-size: $font-md;
    color: $primary-color;
    font-weight: $font-bold;
    cursor: pointer;
    transition: all $transition-fast;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    flex-shrink: 0; // 防止按钮被压缩

    &:active {
      background: $bg-hover;
      transform: scale(0.95);
    }
  }

  .quantity-input {
    width: 40px;
    height: 32px;
    text-align: center;
    border: none;
    background: transparent;
    font-size: $font-base;
    color: $text-primary;
    font-weight: $font-medium;
    flex-shrink: 0; // 防止输入框被压缩
  }
}

// 移动端适配
@media (max-width: 750px) {
  .cart-item {
    padding: $spacing-sm;
    gap: $spacing-sm;
  }

  .product-image {
    width: 65px;
    height: 65px;
  }

  .item-info {
    gap: $spacing-xs;

    .product-name {
      font-size: $font-sm;
    }

    .spec-info {
      font-size: $font-xs;
    }

    .price-row {
      .price {
        font-size: $font-base;
        min-width: 70px;
      }
    }
  }

  .quantity-control {
    min-width: 110px;
    gap: $spacing-xs;
    padding: 2px;

    .btn-quantity {
      width: 28px;
      height: 28px;
      font-size: $font-sm;
    }

    .quantity-input {
      width: 36px;
      height: 28px;
      font-size: $font-sm;
    }
  }
}

// 小屏幕设备进一步优化
@media (max-width: 400px) {
  .cart-item {
    padding: $spacing-xs;
    gap: $spacing-xs;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .item-info {
    .product-name {
      font-size: $font-sm;
    }

    .spec-info {
      font-size: $font-xs;
    }

    .price-row {
      .price {
        font-size: $font-sm;
        min-width: 60px;
      }
    }
  }

  .quantity-control {
    min-width: 100px;
    gap: 2px;
    padding: 1px;

    .btn-quantity {
      width: 24px;
      height: 24px;
      font-size: $font-xs;
    }

    .quantity-input {
      width: 32px;
      height: 24px;
      font-size: $font-xs;
    }
  }
}

// 底部结算栏
.cart-footer {
  @include flex-between;
  position: fixed;

  bottom: 0;

  left: 0;
  right: 0;
  height: 64px;
  padding: $spacing-md $spacing-lg;
  background: $white;
  border-top: 1px solid $border-light;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  z-index: 100;

  .footer-left {
    @include flex-align-center;
    gap: $spacing-sm;

    .select-all-text {
      font-size: $font-base;
      color: $text-primary;
      font-weight: $font-medium;
    }
  }

  .footer-right {
    @include flex-align-center;
    gap: $spacing-lg;

    .total-section {
      @include flex-align-center;
      gap: $spacing-xs;

      .total-label {
        font-size: $font-base;
        color: $text-secondary;
      }

      .total-price {
        font-size: $font-xl;
        font-weight: $font-bold;
        color: $error-color;
      }
    }

    .btn-checkout {
      @include btn-primary;
      min-width: 100px;
      padding: $spacing-md $spacing-xl;
    }
  }
}
</style>
