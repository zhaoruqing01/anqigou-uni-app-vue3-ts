<template>
  <view class="favorite-container">
    <view class="favorite-header">
      <text class="title">我的收藏</text>
      <text v-if="selectedCount > 0" class="selected-count"
        >{{ selectedCount }} 已选</text
      >
      <text class="edit-btn" @click="toggleEdit">{{
        isEdit ? "完成" : "编辑"
      }}</text>
    </view>

    <view v-if="favorites.length === 0" class="empty-favorite">
      <image src="@/static/images/cart-empty.png" mode="aspectFit"></image>
      <text>还没有收藏商品</text>
      <navigator url="/pages/index/index" class="go-shopping">去逛逛</navigator>
    </view>

    <view v-else class="favorite-list">
      <view v-for="item in favorites" :key="item.id" class="favorite-item">
        <view class="checkbox-container" v-if="isEdit">
          <checkbox
            :checked="item.checked"
            @change="toggleItem(item)"
          ></checkbox>
        </view>
        <navigator
          :url="`/pages/product/detail?id=${item.productId}`"
          class="product-info"
        >
          <image :src="item.product?.mainImage || ''" mode="aspectFit"></image>
          <view class="product-details">
            <text class="product-name">{{ item.product?.name || "" }}</text>
            <text class="product-price"
              >¥{{ (item.product?.price || 0) / 100 }}</text
            >
            <text
              class="original-price"
              v-if="item.product?.originalPrice > item.product?.price"
              >¥{{ (item.product?.originalPrice || 0) / 100 }}</text
            >
            <view class="product-stock" v-if="item.product?.stock > 0">
              <text class="stock-text">有货</text>
            </view>
            <view class="product-stock out-of-stock" v-else>
              <text class="stock-text">缺货</text>
            </view>
          </view>
        </navigator>
        <view class="action-buttons" v-if="!isEdit">
          <button
            class="cancel-btn"
            @click.stop="cancelFavorite(item.productId)"
          >
            取消收藏
          </button>
          <button class="add-cart-btn" @click.stop="addToCart(item.productId)">
            加入购物车
          </button>
        </view>
      </view>
    </view>

    <view v-if="isEdit && favorites.length > 0" class="edit-footer">
      <view class="select-all">
        <checkbox :checked="isAllSelected" @change="toggleSelectAll"></checkbox>
        <text>全选</text>
      </view>
      <button
        class="batch-cancel-btn"
        @click="batchCancel"
        :disabled="selectedCount === 0"
      >
        批量删除
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { addToCart as apiAddToCart } from "@/api/cart";
import { batchCancelFavorite, listFavorites } from "@/api/favorite";
import { computed, onMounted, ref } from "vue";

const favorites = ref<any[]>([]);
const isEdit = ref(false);
const isLoading = ref(false);

// 编辑状态下的选中项
const selectedCount = computed(() => {
  return favorites.value.filter((item) => item.checked).length;
});

const isAllSelected = computed(() => {
  return (
    favorites.value.length > 0 && favorites.value.every((item) => item.checked)
  );
});

// 获取收藏列表
const getFavorites = async () => {
  isLoading.value = true;
  try {
    const res = await listFavorites();
    if (res.code === 200) {
      favorites.value = res.data.map((item: any) => ({
        ...item,
        checked: false,
      }));
    }
  } catch (error) {
    console.error("获取收藏列表失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 切换编辑状态
const toggleEdit = () => {
  isEdit.value = !isEdit.value;
  // 退出编辑状态时清空选中
  if (!isEdit.value) {
    favorites.value.forEach((item) => {
      item.checked = false;
    });
  }
};

// 切换全选
const toggleSelectAll = () => {
  const checked = !isAllSelected.value;
  favorites.value.forEach((item) => {
    item.checked = checked;
  });
};

// 切换单个商品选中状态
const toggleItem = (item: any) => {
  item.checked = !item.checked;
};

// 批量取消收藏
const batchCancel = async () => {
  const selectedIds = favorites.value
    .filter((item) => item.checked)
    .map((item) => item.productId);
  if (selectedIds.length === 0) return;

  uni.showModal({
    title: "提示",
    content: `确定要取消收藏这${selectedIds.length}件商品吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await batchCancelFavorite(selectedIds);
          if (result.code === 200) {
            uni.showToast({ title: "取消成功", icon: "success" });
            getFavorites();
          }
        } catch (error) {
          console.error("批量取消收藏失败:", error);
          uni.showToast({ title: "取消失败", icon: "error" });
        }
      }
    },
  });
};

// 取消收藏单个商品
const cancelFavorite = async (productId: string) => {
  uni.showModal({
    title: "提示",
    content: "确定要取消收藏该商品吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await batchCancelFavorite([productId]);
          if (result.code === 200) {
            uni.showToast({ title: "取消成功", icon: "success" });
            getFavorites();
          }
        } catch (error) {
          console.error("取消收藏失败:", error);
          uni.showToast({ title: "取消失败", icon: "error" });
        }
      }
    },
  });
};

// 加入购物车
const addToCart = async (productId: string) => {
  try {
    // TODO: 需要获取商品的skuId，这里暂时使用productId
    await apiAddToCart({
      productId: productId,
      skuId: productId, // 临时使用productId作为skuId
      quantity: 1,
    });
    uni.showToast({ title: "已加入购物车", icon: "success" });
  } catch (error) {
    console.error("加入购物车失败:", error);
    uni.showToast({ title: "加入失败", icon: "error" });
  }
};

onMounted(() => {
  getFavorites();
});
</script>

<style scoped>
.favorite-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.favorite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.selected-count {
  font-size: 14px;
  color: #2ecaa6;
}

.edit-btn {
  font-size: 14px;
  color: #2ecaa6;
}

.empty-favorite {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: #fff;
  margin: 20px;
  border-radius: 8px;
}

.empty-favorite image {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.empty-favorite text {
  font-size: 16px;
  color: #999;
  margin-bottom: 20px;
}

.go-shopping {
  padding: 10px 20px;
  background-color: #2ecaa6;
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
}

.favorite-list {
  background-color: #fff;
  margin: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.favorite-item:last-child {
  border-bottom: none;
}

.checkbox-container {
  margin-right: 10px;
}

.product-info {
  display: flex;
  flex: 1;
  align-items: center;
}

.product-info image {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  border-radius: 4px;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 16px;
  color: #ff4444;
  font-weight: bold;
  margin-bottom: 5px;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-left: 10px;
}

.product-stock {
  display: inline-block;
  padding: 2px 8px;
  background-color: #e8f5e8;
  border-radius: 10px;
  margin-top: 5px;
}

.product-stock.out-of-stock {
  background-color: #ffebee;
}

.stock-text {
  font-size: 12px;
  color: #4caf50;
}

.product-stock.out-of-stock .stock-text {
  color: #f44336;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 4px;
}

.add-cart-btn {
  background-color: #2ecaa6;
  color: #fff;
  border: none;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 4px;
}

.edit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #fff;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 5px;
}

.batch-cancel-btn {
  background-color: #ff4444;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
}

.batch-cancel-btn:disabled {
  background-color: #ffcccc;
}
</style>
