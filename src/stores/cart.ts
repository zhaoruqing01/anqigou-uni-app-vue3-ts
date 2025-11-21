import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  mainImage: string;
  skuId: string;
  specInfo: string;
  quantity: number;
  checked: boolean;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  // 计算购物车商品总数
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // 计算已选商品的总金额
  const totalPrice = computed(() => {
    return items.value
      .filter((item) => item.checked)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  // 计算已选商品数量
  const checkedCount = computed(() => {
    return items.value.filter((item) => item.checked).length;
  });

  // 添加商品到购物车
  const addItem = (item: CartItem) => {
    const existItem = items.value.find(
      (i) => i.productId === item.productId && i.skuId === item.skuId
    );
    if (existItem) {
      existItem.quantity += item.quantity;
    } else {
      items.value.push(item);
    }
    saveToStorage();
  };

  // 更新商品数量
  const updateQuantity = (cartItemId: string, quantity: number) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveToStorage();
    }
  };

  // 删除商品
  const removeItem = (cartItemId: string) => {
    items.value = items.value.filter((i) => i.id !== cartItemId);
    saveToStorage();
  };

  // 批量删除选中商品
  const removeCheckedItems = () => {
    items.value = items.value.filter((i) => !i.checked);
    saveToStorage();
  };

  // 切换商品选中状态
  const toggleItem = (cartItemId: string) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (item) {
      item.checked = !item.checked;
      saveToStorage();
    }
  };

  // 全选/取消全选
  const toggleAllItems = (checked: boolean) => {
    items.value.forEach((item) => {
      item.checked = checked;
    });
    saveToStorage();
  };

  // 清空购物车
  const clearCart = () => {
    items.value = [];
    saveToStorage();
  };

  // 保存到本地存储
  const saveToStorage = () => {
    uni.setStorageSync('cartItems', JSON.stringify(items.value));
  };

  // 从本地存储恢复
  const restoreFromStorage = () => {
    const stored = uni.getStorageSync('cartItems');
    if (stored) {
      try {
        items.value = JSON.parse(stored as string);
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
  };

  return {
    items,
    totalCount,
    totalPrice,
    checkedCount,
    addItem,
    updateQuantity,
    removeItem,
    removeCheckedItems,
    toggleItem,
    toggleAllItems,
    clearCart,
    restoreFromStorage,
  };
});
