<template>
  <view class="container">
    <view class="header">
      <text>购物车</text>
      <text v-if="items.length > 0" class="edit-btn" @click="isEdit = !isEdit">
        {{ isEdit ? '完成' : '编辑' }}
      </text>
    </view>

    <view v-if="items.length === 0" class="empty">
      <text>购物车空空如也</text>
      <button @click="goHome">返回首页</button>
    </view>

    <view v-else>
      <!-- 购物车列表 -->
      <view class="cart-list">
        <view v-for="item in items" :key="item.id" class="cart-item">
          <checkbox v-if="!isEdit" :checked="item.checked" @change="toggleItem(item.id)" />
          <image :src="item.mainImage" mode="aspectFill" />
          <view class="item-info">
            <view class="product-name">{{ item.productName }}</view>
            <view class="spec-info">{{ item.specInfo }}</view>
            <view class="price">¥{{ (item.price / 100).toFixed(2) }}</view>
          </view>
          <view class="quantity-control">
            <button @click="decreaseQuantity(item.id)">-</button>
            <input :value="item.quantity" type="number" readonly />
            <button @click="increaseQuantity(item.id)">+</button>
          </view>
          <button v-if="isEdit" class="delete-btn" @click="removeItem(item.id)">删除</button>
        </view>
      </view>

      <!-- 底部统计 -->
      <view class="cart-footer">
        <view class="left">
          <checkbox :checked="isAllChecked" @change="toggleAllItems" />
          <text>全选</text>
        </view>
        <view class="right">
          <text>总计: ¥{{ (totalPrice / 100).toFixed(2) }}</text>
          <button v-if="!isEdit" @click="checkout">结算({{ checkedCount }})</button>
          <button v-if="isEdit" @click="deleteChecked">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { computed, ref } from 'vue';

const cartStore = useCartStore();
const isEdit = ref(false);

const items = computed(() => cartStore.items);
const totalPrice = computed(() => cartStore.totalPrice);
const checkedCount = computed(() => cartStore.checkedCount);
const isAllChecked = computed(() => items.value.length > 0 && items.value.every((i) => i.checked));

const toggleItem = (cartItemId: string) => {
  cartStore.toggleItem(cartItemId);
};

const toggleAllItems = () => {
  cartStore.toggleAllItems(!isAllChecked.value);
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
    success: (res) => {
      if (res.confirm) {
        cartStore.removeItem(cartItemId);
      }
    },
  });
};

const deleteChecked = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除选中商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartStore.removeCheckedItems();
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
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9ff;
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
  position: relative;
  box-shadow: 0 2px 10px rgba(84, 129, 99, 0.3);
}

.header:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.95);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #999;
}

.empty text {
  font-size: 16px;
  margin-bottom: 20px;
}

.empty button {
  margin-top: 10px;
  padding: 12px 32px;
  background: #548163;
  color: white;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.3);
  transition: all 0.3s ease;
}

.empty button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}

.cart-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.cart-list::-webkit-scrollbar {
  width: 4px;
}

.cart-list::-webkit-scrollbar-thumb {
  background: rgba(84, 129, 99, 0.3);
  border-radius: 2px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.cart-item:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.cart-item image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f5f5f5;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spec-info {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.price {
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 4px;
}

.quantity-control button {
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #548163;
  font-weight: bold;
  transition: all 0.2s ease;
  cursor: pointer;
}

.quantity-control button:active {
  background: #f0f0f0;
  transform: scale(0.95);
}

.quantity-control input {
  width: 32px;
  height: 28px;
  text-align: center;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
}

.delete-btn {
  padding: 6px 12px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.delete-btn:active {
  background: #ff5252;
  transform: scale(0.95);
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  font-size: 14px;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.right text {
  font-size: 14px;
  color: #666;
  min-width: 80px;
  text-align: right;
}

.right button {
  padding: 10px 20px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  min-width: 100px;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.right button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}
</style>
