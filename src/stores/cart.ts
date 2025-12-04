import {
  addToCart as addToCartAPI,
  clearCart as clearCartAPI,
  getCartList,
  removeCartItem as removeCartItemAPI,
  updateCartQuantity as updateCartQuantityAPI,
} from '@/api/cart';
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
  sellerId: string;
  sellerName: string;
  stock: number;
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const loading = ref(false);

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
      const sellerId = item.sellerId || 'default';
      if (!grouped[sellerId]) {
        grouped[sellerId] = [];
      }
      grouped[sellerId].push(item);
    });
    return Object.entries(grouped).map(([sellerId, items]) => ({
      sellerId,
      sellerName: items[0]?.sellerName || '默认商家',
      items,
    }));
  });

  // 从后端加载购物车
  const loadCart = async () => {
    try {
      loading.value = true;
      const res: any = await getCartList();
      if (res.code === 0 && res.data) {
        // 保存当前选中状态
        const currentCheckedState: Record<string, boolean> = {};
        items.value.forEach((item) => {
          currentCheckedState[item.skuId] = item.checked;
        });

        // 后端返回的数据需要转换为前端CartItem格式
        items.value = res.data.map((item: any) => {
          const skuId = item.skuId || '';
          return {
            id: skuId, // 临时使用skuId作为id
            productId: item.productId || '',
            productName: item.productName || '商品名称',
            price: item.price || 10000,
            mainImage: item.mainImage || '',
            skuId: skuId,
            specInfo: item.specInfo || '默认规格',
            quantity: item.quantity || 1,
            // 保持原有的选中状态，如果没有则默认不选中
            checked: currentCheckedState[skuId] ?? false,
            sellerId: 'default',
            sellerName: '默认商家',
            stock: item.stock || 999,
          };
        });
      }
    } catch (error) {
      console.error('加载购物车失败', error);
      uni.showToast({ title: '加载购物车失败', icon: 'error' });
    } finally {
      loading.value = false;
    }
  };

  // 添加商品到购物车
  const addItem = async (item: CartItem) => {
    try {
      await addToCartAPI({
        productId: item.productId,
        skuId: item.skuId,
        quantity: item.quantity,
      });

      // 添加成功后重新加载购物车
      await loadCart();

      // 确保刚添加的商品被设置为选中状态
      // 如果由于某些原因商品没有出现在购物车列表中，我们手动添加它
      const addedItem = items.value.find((i) => i.skuId === item.skuId);
      if (addedItem) {
        addedItem.checked = true;
      } else {
        // 如果商品没有出现在列表中，手动添加它
        items.value.push({
          ...item,
          checked: true,
        });
      }

      uni.showToast({ title: '已加入购物车', icon: 'success' });
    } catch (error) {
      console.error('添加到购物车失败', error);
      uni.showToast({ title: '添加失败', icon: 'error' });
    }
  };

  // 更新商品数量
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (!item) return;

    try {
      await updateCartQuantityAPI({
        skuId: item.skuId,
        quantity: Math.max(1, quantity),
      });

      // 更新本地数据
      item.quantity = Math.max(1, quantity);
    } catch (error) {
      console.error('更新数量失败', error);
      uni.showToast({ title: '更新失败', icon: 'error' });
    }
  };

  // 删除商品
  const removeItem = async (cartItemId: string) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (!item) return;

    try {
      await removeCartItemAPI(item.skuId);

      // 从本地列表移除
      items.value = items.value.filter((i) => i.id !== cartItemId);

      uni.showToast({ title: '已删除', icon: 'success' });
    } catch (error) {
      console.error('删除商品失败', error);
      uni.showToast({ title: '删除失败', icon: 'error' });
    }
  };

  // 批量删除选中商品
  const removeCheckedItems = async () => {
    const checkedItems = items.value.filter((i) => i.checked);
    if (checkedItems.length === 0) return;

    // 批量删除
    await Promise.all(checkedItems.map((item) => removeCartItemAPI(item.skuId)));
    // 从本地列表移除
    items.value = items.value.filter((i) => !i.checked);
    uni.showToast({ title: '已删除' });
  };

  // 切换商品选中状态（仅前端操作）
  const toggleItem = (cartItemId: string) => {
    const item = items.value.find((i) => i.id === cartItemId);
    if (item) {
      item.checked = !item.checked;
    }
  };

  // 全选/取消全选（仅前端操作）
  const toggleAllItems = (checked: boolean) => {
    items.value.forEach((item) => {
      item.checked = checked;
    });
  };

  // 切换全选状态（仅前端操作）
  const toggleSelectAll = () => {
    const shouldSelectAll = !isAllChecked.value;
    items.value.forEach((item) => {
      item.checked = shouldSelectAll;
    });
  };

  // 清空购物车
  const clearCart = async () => {
    try {
      await clearCartAPI();
      items.value = [];
      uni.showToast({ title: '购物车已清空', icon: 'success' });
    } catch (error) {
      console.error('清空购物车失败', error);
      uni.showToast({ title: '清空失败', icon: 'error' });
    }
  };

  // 兼容旧版本：从本地存储恢复（现在改为从后端加载）
  const restoreFromStorage = async () => {
    await loadCart();
  };

  // 更新购物车商品的库存信息
  const updateCartStock = async () => {
    // 重新加载购物车即可获取最新库存
    await loadCart();
  };

  return {
    items,
    itemsBySeller,
    totalCount,
    totalPrice,
    checkedCount,
    isAllChecked,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    removeCheckedItems,
    toggleItem,
    toggleAllItems,
    toggleSelectAll,
    clearCart,
    loadCart,
    restoreFromStorage,
    updateCartStock,
  };
});
