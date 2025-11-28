import { defineStore } from "pinia";
import { computed, ref } from "vue";

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
  sellerId: string;
  sellerName: string;
  stock: number; // 商品库存
}

export const useCartStore = defineStore("cart", () => {
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

  // 按商家分组的购物车商品
  const itemsBySeller = computed(() => {
    const grouped: Record<string, CartItem[]> = {};
    items.value.forEach((item) => {
      const sellerId = item.sellerId;
      if (!grouped[sellerId]) {
        grouped[sellerId] = [];
      }
      grouped[sellerId].push(item);
    });
    return Object.entries(grouped).map(([sellerId, items]) => ({
      sellerId,
      sellerName: items[0].sellerName,
      items,
    }));
  });

  // 校验库存，确保商品数量不超过库存
  const checkStock = (item: CartItem) => {
    if (item.quantity > item.stock) {
      item.quantity = item.stock;
      uni.showToast({
        title: `${item.productName}库存不足，已调整至最大库存`,
        icon: "none",
      });
    }
    return item.quantity;
  };

  // 添加商品到购物车
  const addItem = (item: CartItem) => {
    const existItem = items.value.find(
      (i) => i.productId === item.productId && i.skuId === item.skuId
    );
    if (existItem) {
      existItem.quantity += item.quantity;
      checkStock(existItem);
    } else {
      items.value.push(item);
      checkStock(item);
    }
    saveToStorage();
  };

  // 更新商品数量
  const updateQuantity = (cartItemId: string, quantity: number) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      checkStock(item);
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
    uni.setStorageSync("cartItems", JSON.stringify(items.value));
  };

  // 从本地存储恢复
  const restoreFromStorage = () => {
    const stored = uni.getStorageSync("cartItems");
    if (stored) {
      try {
        const parsedItems = JSON.parse(stored as string);
        // 确保每个项目都有 checked 和 stock 属性
        items.value = parsedItems.map((item: CartItem) => ({
          ...item,
          checked: item.checked ?? false, // 如果没有 checked 属性，默认设为 false
          stock: item.stock ?? 999, // 如果没有 stock 属性，默认设为 999
        }));
        // 恢复后校验库存
        items.value.forEach((item) => checkStock(item));
      } catch (e) {
        console.error("Failed to parse cart items", e);
        items.value = []; // 解析失败时清空购物车
      }
    }
  };

  // 更新购物车商品的库存信息（从后端获取最新库存）
  const updateCartStock = async () => {
    // 实际开发中，这里应该调用后端API获取最新库存
    // 模拟从后端获取库存数据
    try {
      // const response = await request.post('/cart/update-stock', {
      //   items: items.value.map(item => ({ skuId: item.skuId }))
      // });
      // if (response.code === 200) {
      //   const stockMap = response.data.stockMap;
      //   items.value.forEach(item => {
      //     if (stockMap[item.skuId]) {
      //       item.stock = stockMap[item.skuId];
      //       checkStock(item);
      //     }
      //   });
      // }

      // 模拟更新库存，随机生成库存数量
      items.value.forEach((item) => {
        item.stock = Math.floor(Math.random() * 50) + 10; // 随机生成10-59的库存
        checkStock(item);
      });

      saveToStorage();
    } catch (error) {
      console.error("Failed to update cart stock", error);
    }
  };

  return {
    items,
    itemsBySeller,
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
    updateCartStock,
  };
});
