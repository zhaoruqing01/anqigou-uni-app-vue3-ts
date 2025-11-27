<template>
  <view class="container">
    <view class="header">
      <text>购物车</text>
      <text v-if="items.length > 0" class="edit-btn" @click="isEdit = !isEdit">
        {{ isEdit ? "完成" : "编辑" }}
      </text>
    </view>

    <view v-if="items.length === 0" class="empty">
      <image
        src="/static/images/cart-empty.png"
        mode="aspectFill"
        style="width: 130px; height: 130px; margin-bottom: 20px"
      />
      <text>购物车空空如也~</text>
      <button @click="goHome">去购物</button>
    </view>

    <view v-else>
      <!-- 购物车列表 -->
      <view class="cart-list">
        <view v-for="item in items" :key="item.id" class="cart-item">
          <checkbox
            v-if="!isEdit"
            :checked="item.checked"
            @click="toggleItem(item.id)"
          />
          <image
            :src="item.mainImage"
            style="width: 80px; height: 80px"
            mode="aspectFill"
          />
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
          <button v-if="isEdit" class="delete-btn" @click="removeItem(item.id)">
            删除
          </button>
        </view>
      </view>

      <!-- 底部统计 -->
      <view class="cart-footer">
        <view class="left">
          <checkbox
            v-if="!isEdit"
            :checked="isAllChecked"
            @click="toggleAllItems"
          />
          <checkbox v-else :checked="isAllChecked" @click="toggleAllItems" />
          <text>全选</text>
        </view>
        <view class="right">
          <text v-if="!isEdit">总计: ¥{{ (totalPrice / 100).toFixed(2) }}</text>
          <button v-if="!isEdit" @click="checkout">
            结算({{ checkedCount }})
          </button>
          <view v-else class="batch-actions">
            <button @click="moveToFavorites">移入收藏夹</button>
            <button class="delete-btn" @click="deleteChecked">删除</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { addFavorite } from "@/api/favorite";
import { useCartStore } from "@/stores/cart";
import { computed, ref } from "vue";

const cartStore = useCartStore();
const isEdit = ref(false);

// 页面加载时从本地存储恢复购物车数据
cartStore.restoreFromStorage();

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
}

// 从store获取购物车项目
const items = computed(() => cartStore.items);
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

const deleteChecked = () => {
  uni.showModal({
    title: "提示",
    content: "确定要删除选中商品吗？",
    success: (res) => {
      if (res.confirm) {
        cartStore.removeCheckedItems();
      }
    },
  });
};

// 批量移入收藏夹
const moveToFavorites = () => {
  const checkedItems = items.value.filter((item) => item.checked);
  if (checkedItems.length === 0) {
    uni.showToast({ title: "请选择要移入收藏夹的商品", icon: "error" });
    return;
  }

  uni.showModal({
    title: "提示",
    content: `确定要将${checkedItems.length}件商品移入收藏夹吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: "处理中..." });
        try {
          // 批量添加到收藏夹
          for (const item of checkedItems) {
            await addFavorite(item.productId);
          }
          // 从购物车中移除已添加到收藏夹的商品
          cartStore.removeCheckedItems();
          uni.hideLoading();
          uni.showToast({ title: "已成功移入收藏夹", icon: "success" });
        } catch (error) {
          uni.hideLoading();
          uni.showToast({ title: "移入收藏夹失败", icon: "error" });
          console.error("移入收藏夹失败:", error);
        }
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
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9ff;
  position: relative;
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
  // padding: 12px 32px;
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
  position: relative;
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
  position: absolute;
  right: 5px;
  bottom: 5px;
}

.quantity-control button {
  width: 20px;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
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
  // padding: 10px 20px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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
