<template>
  <view class="favorite-container">
    <view class="favorite-header">
      <text class="title">我的收藏</text>
      <text v-if="selectedCount > 0" class="selected-count">{{ selectedCount }} 已选</text>
      <text class="edit-btn" @click="toggleEdit">{{ isEdit ? '完成' : '编辑' }}</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading && favorites.length === 0" class="loading-container">
      <uni-load-more
        :status="'loading'"
        :content-text="{
          contentdown: '下拉刷新',
          contentrefresh: '加载中...',
          contentnomore: '没有更多了',
        }"
      ></uni-load-more>
    </view>

    <!-- 空状态 -->
    <view v-else-if="favorites.length === 0" class="empty-favorite">
      <image src="@/static/images/cart-empty.png" mode="aspectFit"></image>
      <text class="empty-text">还没有收藏商品</text>
      <navigator url="/pages/index/index" class="go-shopping">去逛逛</navigator>
    </view>

    <!-- 收藏列表 -->
    <scroll-view
      v-else
      class="favorite-scroll"
      scroll-y
      enable-back-to-top
      @scrolltolower="loadMore"
      @refresherpulling="onRefresh"
      @refresherrefresh="onRefresh"
      refresher-enabled="true"
      refresher-threshold="60"
      refresher-background="#f5f5f5"
    >
      <view class="favorite-list">
        <view v-for="item in favorites" :key="item.id" class="favorite-item">
          <view class="checkbox-container" v-if="isEdit">
            <checkbox
              :checked="item.checked"
              @change="toggleItem(item)"
              class="custom-checkbox"
            ></checkbox>
          </view>
          <navigator :url="`/pages/product/detail?id=${item.productId}`" class="product-info">
            <image
              :src="item.mainImage || '@/static/images/default-product.png'"
              mode="aspectFill"
              class="product-image"
            ></image>
            <view class="product-details">
              <text class="product-name">{{ item.productName || '商品名称' }}</text>
              <view class="price-container">
                <text class="product-price">¥{{ (item.price || 0) / 100 }}</text>
                <text class="original-price" v-if="item.originalPrice > item.price">
                  ¥{{ (item.originalPrice || 0) / 100 }}
                </text>
              </view>
              <view class="product-meta">
                <view class="product-stock" :class="{ 'out-of-stock': item.stock <= 0 }">
                  <text class="stock-text">{{ item.stock > 0 ? '有货' : '缺货' }}</text>
                </view>
                <text class="sold-count">已售 {{ item.soldCount || 0 }}</text>
              </view>
              <view class="rating-container">
                <text class="rating">★{{ item.rating || 0 }}</text>
                <text class="rating-count">({{ item.ratingCount || 0 }})</text>
              </view>
            </view>
          </navigator>
          <view class="action-buttons" v-if="!isEdit">
            <button class="cancel-btn" @click.stop="cancelFavorite(item.productId)">
              取消收藏
            </button>
            <button class="add-cart-btn" @click.stop="addToCart(item.productId)">加入购物车</button>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="load-more-container">
        <uni-load-more
          :status="loadMoreStatus"
          :content-text="{
            contentdown: '下拉刷新',
            contentrefresh: '加载中...',
            contentnomore: '没有更多了',
          }"
        ></uni-load-more>
      </view>
    </scroll-view>

    <!-- 编辑底部栏 -->
    <view v-if="isEdit && favorites.length > 0" class="edit-footer">
      <view class="select-all">
        <checkbox
          :checked="isAllSelected"
          @change="toggleSelectAll"
          class="custom-checkbox"
        ></checkbox>
        <text>全选</text>
      </view>
      <button class="batch-cancel-btn" @click="batchCancel" :disabled="selectedCount === 0">
        批量删除 ({{ selectedCount }})
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { addToCart as apiAddToCart } from '@/api/cart';
import { batchCancelFavorite, listFavorites } from '@/api/favorite';
import { computed, onMounted, ref } from 'vue';

// 收藏列表数据
const favorites = ref<any[]>([]);
// 编辑状态
const isEdit = ref(false);
// 加载状态
const isLoading = ref(false);
// 下拉刷新状态
const isRefreshing = ref(false);
// 加载更多状态
const loadMoreStatus = ref('more');
// 当前页码
const currentPage = ref(1);
// 每页数量
const pageSize = ref(10);
// 是否还有更多数据
const hasMore = ref(true);

// 编辑状态下的选中项
const selectedCount = computed(() => {
  return favorites.value.filter((item) => item.checked).length;
});

// 是否全选
const isAllSelected = computed(() => {
  return favorites.value.length > 0 && favorites.value.every((item) => item.checked);
});

// 获取收藏列表
const getFavorites = async (isRefresh = false) => {
  if (isRefresh) {
    currentPage.value = 1;
    hasMore.value = true;
    favorites.value = [];
  }

  if (!hasMore.value && !isRefresh) {
    loadMoreStatus.value = 'noMore';
    return;
  }

  isLoading.value = true;
  try {
    const res = await listFavorites(currentPage.value, pageSize.value);
    if (res.code === 0) {
      const newData = res.data.map((item: any) => ({
        ...item,
        checked: false,
      }));

      if (isRefresh) {
        favorites.value = newData;
      } else {
        favorites.value = [...favorites.value, ...newData];
      }

      // 判断是否还有更多数据
      if (newData.length < pageSize.value) {
        hasMore.value = false;
        loadMoreStatus.value = 'noMore';
      } else {
        currentPage.value++;
        loadMoreStatus.value = 'more';
      }
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    uni.showToast({ title: '获取收藏列表失败', icon: 'error' });
  } finally {
    isLoading.value = false;
    isRefreshing.value = false;
  }
};

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true;
  getFavorites(true);
};

// 加载更多
const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    getFavorites();
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
  const selectedIds = favorites.value.filter((item) => item.checked).map((item) => item.productId);
  if (selectedIds.length === 0) return;

  uni.showModal({
    title: '提示',
    content: `确定要取消收藏这${selectedIds.length}件商品吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await batchCancelFavorite(selectedIds);
          if (result.code === 0) {
            uni.showToast({ title: '取消成功', icon: 'success' });
            getFavorites(true);
          }
        } catch (error) {
          console.error('批量取消收藏失败:', error);
          uni.showToast({ title: '取消失败', icon: 'error' });
        }
      }
    },
  });
};

// 取消收藏单个商品
const cancelFavorite = async (productId: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消收藏该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await batchCancelFavorite([productId]);
          if (result.code === 0) {
            uni.showToast({ title: '取消成功', icon: 'success' });
            getFavorites(true);
          }
        } catch (error) {
          console.error('取消收藏失败:', error);
          uni.showToast({ title: '取消失败', icon: 'error' });
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
    uni.showToast({ title: '已加入购物车', icon: 'success' });
  } catch (error) {
    console.error('加入购物车失败:', error);
    uni.showToast({ title: '加入失败', icon: 'error' });
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
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.selected-count {
  font-size: 14px;
  color: #2ecaa6;
  font-weight: 500;
}

.edit-btn {
  font-size: 14px;
  color: #2ecaa6;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 16px;
  background-color: rgba(46, 202, 166, 0.1);
}

/* 加载状态 */
.loading-container {
  padding: 40px 0;
  background-color: #fff;
  margin: 20px;
  border-radius: 8px;
  text-align: center;
}

/* 空状态 */
.empty-favorite {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background-color: #fff;
  margin: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-favorite image {
  width: 140px;
  height: 140px;
  margin-bottom: 24px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  color: #999;
  margin-bottom: 24px;
  line-height: 24px;
}

.go-shopping {
  padding: 12px 32px;
  background-color: #2ecaa6;
  color: #fff;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(46, 202, 166, 0.3);
  transition: all 0.3s ease;
}

.go-shopping:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(46, 202, 166, 0.2);
}

/* 滚动视图 */
.favorite-scroll {
  height: calc(100vh - 60px);
}

/* 收藏列表 */
.favorite-list {
  background-color: #fff;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 收藏项 */
.favorite-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s ease;
}

.favorite-item:last-child {
  border-bottom: none;
}

.favorite-item:active {
  background-color: #fafafa;
}

/* 复选框容器 */
.checkbox-container {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox {
  transform: scale(1.2);
  color: #2ecaa6;
}

/* 商品信息 */
.product-info {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
}

/* 商品图片 */
.product-image {
  width: 90px;
  height: 90px;
  border-radius: 8px;
  background-color: #f5f5f5;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 商品详情 */
.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

/* 商品名称 */
.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 20px;
}

/* 价格容器 */
.price-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 商品价格 */
.product-price {
  font-size: 18px;
  color: #ff4444;
  font-weight: 600;
}

/* 原价 */
.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

/* 商品元数据 */
.product-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

/* 库存状态 */
.product-stock {
  display: inline-block;
  padding: 2px 8px;
  background-color: #e8f5e8;
  border-radius: 10px;
}

.product-stock.out-of-stock {
  background-color: #ffebee;
}

.stock-text {
  font-size: 11px;
  color: #4caf50;
  font-weight: 500;
}

.product-stock.out-of-stock .stock-text {
  color: #f44336;
}

/* 销量 */
.sold-count {
  color: #999;
  font-size: 11px;
}

/* 评分容器 */
.rating-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 评分 */
.rating {
  font-size: 12px;
  color: #ffb400;
  font-weight: 500;
}

/* 评分数量 */
.rating-count {
  font-size: 11px;
  color: #999;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 取消收藏按钮 */
.cancel-btn {
  background-color: #f8f8f8;
  color: #666;
  border: 1px solid #e0e0e0;
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn:active {
  background-color: #f0f0f0;
  transform: scale(0.95);
}

/* 加入购物车按钮 */
.add-cart-btn {
  background-color: #2ecaa6;
  color: #fff;
  border: none;
  font-size: 12px;
  padding: 8px 16px;
  border-radius: 16px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(46, 202, 166, 0.2);
  transition: all 0.2s ease;
}

.add-cart-btn:active {
  background-color: #28b090;
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(46, 202, 166, 0.3);
}

/* 编辑底部栏 */
.edit-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

/* 全选 */
.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

/* 批量删除按钮 */
.batch-cancel-btn {
  background-color: #ff4444;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.2);
  transition: all 0.2s ease;
}

.batch-cancel-btn:active {
  background-color: #ff3333;
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(255, 68, 68, 0.3);
}

.batch-cancel-btn:disabled {
  background-color: #ffcccc;
  color: #fff;
  box-shadow: none;
}

/* 加载更多 */
.load-more-container {
  padding: 20px 0;
  text-align: center;
  background-color: #fff;
  margin: 0 12px 12px 12px;
  border-radius: 0 0 12px 12px;
}
</style>
