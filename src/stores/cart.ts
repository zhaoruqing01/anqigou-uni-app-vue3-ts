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

  // 检查是否全选
  const isAllChecked = computed(() => {
    return items.value.length > 0 && items.value.every((item) => item.checked);
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

  // 切换全选状态
  const toggleSelectAll = () => {
    // 如果当前是全选状态，则取消全选；否则全选
    const shouldSelectAll = !isAllChecked.value;
    items.value.forEach((item) => {
      item.checked = shouldSelectAll;
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
        const parsedItems = JSON.parse(stored as string);
        // 确保每个项目都有 checked 属性
        items.value = parsedItems.map((item: CartItem) => ({
          ...item,
          checked: item.checked ?? false // 如果没有 checked 属性，默认设为 false
        }));
      } catch (e) {
        console.error('Failed to parse cart items', e);
        items.value = []; // 解析失败时清空购物车
      }
    }
  };

  return {
    items,
    totalCount,
    totalPrice,
    checkedCount,
    isAllChecked,
    addItem,
    updateQuantity,
    removeItem,
    removeCheckedItems,
    toggleItem,
    toggleAllItems,
    toggleSelectAll,
    clearCart,
    restoreFromStorage,
  };
});
