<template>
  <view class="category-page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input" @tap="goToSearch">
        <text class="icon-search">🔍</text>
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <!-- 一级分类导航 -->
    <scroll-view class="first-category-nav" scroll-x>
      <view class="category-nav-list">
        <view
          v-for="category in firstCategories"
          :key="category.id"
          class="category-nav-item"
          :class="{ active: selectedFirstCategory?.id === category.id }"
          @tap="selectFirstCategory(category)"
        >
          <image
            v-if="category.iconUrl"
            :src="category.iconUrl"
            class="category-icon"
            mode="aspectFit"
          />
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 分类与商品内容区 -->
    <view class="content-container">
      <!-- 左侧：二级分类 -->
      <scroll-view class="second-category-sidebar" scroll-y>
        <view
          v-for="category in secondCategories"
          :key="category.id"
          class="second-category-item"
          :class="{ active: selectedSecondCategory?.id === category.id }"
          @tap="selectSecondCategory(category)"
        >
          <image
            v-if="category.iconUrl"
            :src="category.iconUrl"
            class="category-icon-small"
            mode="aspectFit"
          />
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧：三级分类 + 商品列表 -->
      <view class="main-content">
        <!-- 三级分类 -->
        <scroll-view v-if="thirdCategories.length > 0" class="third-category-list" scroll-x>
          <view class="third-category-items">
            <view
              v-for="category in thirdCategories"
              :key="category.id"
              class="third-category-item"
              :class="{ active: selectedThirdCategory?.id === category.id }"
              @tap="selectThirdCategory(category)"
            >
              <text>{{ category.name }}</text>
            </view>
          </view>
        </scroll-view>

        <!-- 筛选栏 -->
        <view class="filter-bar">
          <view class="filter-item" @tap="toggleSortMenu">
            <text>{{ sortText }}</text>
            <text class="arrow">▼</text>
          </view>
          <view class="filter-item" @tap="toggleFilterPanel">
            <text>筛选</text>
            <text class="arrow">▼</text>
          </view>
          <view class="view-mode" @tap="toggleViewMode">
            <text>{{ viewMode === 'grid' ? '☷' : '☰' }}</text>
          </view>
        </view>

        <!-- 排序菜单 -->
        <view v-if="showSortMenu" class="sort-menu">
          <view
            v-for="item in sortOptions"
            :key="item.value"
            class="sort-menu-item"
            :class="{ active: filter.sortBy === item.value }"
            @tap="selectSort(item.value)"
          >
            <text>{{ item.label }}</text>
            <text v-if="filter.sortBy === item.value" class="check">✓</text>
          </view>
        </view>

        <!-- 商品列表 -->
        <scroll-view
          class="product-list-container"
          scroll-y
          @scrolltolower="loadMore"
          :refresher-enabled="true"
          :refresher-triggered="refreshing"
          @refresherrefresh="onRefresh"
        >
          <!-- 商品数量提示 -->
          <view v-if="products.length > 0" class="product-count">找到 {{ total }} 件商品</view>

          <!-- 网格模式 -->
          <view v-if="viewMode === 'grid'" class="product-grid">
            <view
              v-for="product in products"
              :key="product.id"
              class="product-card-grid"
              @tap="goToDetail(product.id)"
            >
              <image :src="product.mainImage" class="product-image" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
                <view class="product-price-row">
                  <text class="price">¥{{ (product.price / 100).toFixed(2) }}</text>
                  <text v-if="product.originalPrice > product.price" class="original-price">
                    ¥{{ (product.originalPrice / 100).toFixed(2) }}
                  </text>
                </view>
                <view class="product-stats">
                  <text class="sales">已售{{ product.soldCount }}</text>
                  <text class="rating">{{ product.rating.toFixed(1) }}分</text>
                </view>
                <view v-if="product.stock <= 0" class="stock-tag out-of-stock">缺货</view>
                <view v-else-if="product.stock <= 10" class="stock-tag low-stock">
                  仅剩{{ product.stock }}件
                </view>
              </view>
            </view>
          </view>

          <!-- 列表模式 -->
          <view v-else class="product-list">
            <view
              v-for="product in products"
              :key="product.id"
              class="product-card-list"
              @tap="goToDetail(product.id)"
            >
              <image :src="product.mainImage" class="product-image" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ product.name }}</text>
                <text v-if="product.brand" class="product-brand">{{ product.brand }}</text>
                <view class="product-price-row">
                  <text class="price">¥{{ (product.price / 100).toFixed(2) }}</text>
                  <text v-if="product.originalPrice > product.price" class="original-price">
                    ¥{{ (product.originalPrice / 100).toFixed(2) }}
                  </text>
                </view>
                <view class="product-stats">
                  <text class="sales">已售{{ product.soldCount }}</text>
                  <text class="rating">
                    {{ product.rating.toFixed(1) }}分 {{ product.ratingCount }}评
                  </text>
                </view>
                <view v-if="product.stock <= 0" class="stock-tag out-of-stock">缺货</view>
                <view v-else-if="product.stock <= 10" class="stock-tag low-stock">
                  仅剩{{ product.stock }}件
                </view>
              </view>
            </view>
          </view>

          <!-- 加载状态 -->
          <view v-if="loading" class="loading-more">
            <text>加载中...</text>
          </view>
          <view v-else-if="!hasMore && products.length > 0" class="no-more">
            <text>已加载全部</text>
          </view>

          <!-- 空状态 -->
          <view v-if="!loading && products.length === 0" class="empty-state">
            <text class="empty-icon">📦</text>
            <text class="empty-text">暂无商品</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view v-if="showFilterPanel" class="filter-panel-mask" @tap="toggleFilterPanel">
      <view class="filter-panel" @tap.stop>
        <view class="filter-header">
          <text class="filter-title">筛选</text>
          <text class="filter-reset" @tap="resetFilter">重置</text>
        </view>

        <scroll-view class="filter-content" scroll-y>
          <!-- 价格区间 -->
          <view class="filter-section">
            <view class="filter-section-title">价格区间</view>
            <view class="price-options">
              <view
                v-for="range in priceRanges"
                :key="range.label"
                class="price-option"
                :class="{ active: isPriceRangeActive(range) }"
                @tap="selectPriceRange(range)"
              >
                {{ range.label }}
              </view>
            </view>
            <view class="price-custom">
              <input
                v-model="customMinPrice"
                type="number"
                placeholder="最低"
                class="price-input"
              />
              <text class="price-separator">-</text>
              <input
                v-model="customMaxPrice"
                type="number"
                placeholder="最高"
                class="price-input"
              />
              <view class="price-confirm" @tap="applyCustomPrice">确定</view>
            </view>
          </view>

          <!-- 库存状态 -->
          <view class="filter-section">
            <view class="filter-section-title">库存状态</view>
            <view class="stock-options">
              <view
                v-for="option in stockOptions"
                :key="option.value"
                class="stock-option"
                :class="{ active: filter.stockStatus === option.value }"
                @tap="selectStockStatus(option.value)"
              >
                {{ option.label }}
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="filter-footer">
          <view class="filter-cancel" @tap="toggleFilterPanel">取消</view>
          <view class="filter-confirm" @tap="applyFilter">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { listFirstLevelCategories, listProducts, listSubCategories } from '@/api/product';
import type {
  PageResponse,
  ProductCategory,
  ProductFilter,
  ProductListItem,
} from '@/types/product';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

// 分类数据
const firstCategories = ref<ProductCategory[]>([]);
const secondCategories = ref<ProductCategory[]>([]);
const thirdCategories = ref<ProductCategory[]>([]);
const selectedFirstCategory = ref<ProductCategory | null>(null);
const selectedSecondCategory = ref<ProductCategory | null>(null);
const selectedThirdCategory = ref<ProductCategory | null>(null);

// 商品列表
const products = ref<ProductListItem[]>([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const refreshing = ref(false);
const hasMore = ref(true);

// 筛选条件
const filter = ref<ProductFilter>({
  sortBy: 'comprehensive',
});

// 视图模式
const viewMode = ref<'grid' | 'list'>('grid');

// 排序菜单
const showSortMenu = ref(false);
const sortOptions = [
  { label: '综合排序', value: 'comprehensive' },
  { label: '销量从高到低', value: 'sales' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '好评率', value: 'rating' },
  { label: '最新上架', value: 'new' },
];

const sortText = computed(() => {
  const option = sortOptions.find((o) => o.value === filter.value.sortBy);
  return option?.label || '综合排序';
});

// 筛选面板
const showFilterPanel = ref(false);
const priceRanges = [
  { label: '0-50元', min: 0, max: 5000 },
  { label: '50-100元', min: 5000, max: 10000 },
  { label: '100-200元', min: 10000, max: 20000 },
  { label: '200-500元', min: 20000, max: 50000 },
  { label: '500元以上', min: 50000, max: undefined },
];
const customMinPrice = ref('');
const customMaxPrice = ref('');

const stockOptions = [
  { label: '全部', value: 'all' },
  { label: '有货', value: 'in_stock' },
  { label: '缺货', value: 'out_of_stock' },
];

// 页面加载
onLoad((options: any) => {
  const categoryId = options.categoryId;
  if (categoryId) {
    // 从其他页面跳转过来，需要定位到指定分类
    loadCategoryById(categoryId);
  } else {
    loadFirstCategories();
  }
});

onShow(() => {
  // 可能需要刷新数据
});

// 加载一级分类
const loadFirstCategories = async () => {
  try {
    const res: any = await listFirstLevelCategories();
    console.log(res, 'res');

    if (res.code === 0 && res.data) {
      firstCategories.value = res.data;
      if (firstCategories.value.length > 0) {
        selectFirstCategory(firstCategories.value[0]);
      }
    }
  } catch (error) {
    console.error('加载一级分类失败', error);
    uni.showToast({
      title: '加载分类失败',
      icon: 'none',
    });
  }
};

// 通过分类ID加载（用于外部跳转）
const loadCategoryById = async (categoryId: string) => {
  // TODO: 实现根据分类ID定位到对应的分类层级
  loadFirstCategories();
};

// 选择一级分类
const selectFirstCategory = async (category: ProductCategory) => {
  selectedFirstCategory.value = category;
  selectedSecondCategory.value = null;
  selectedThirdCategory.value = null;
  thirdCategories.value = [];

  // 加载二级分类
  await loadSubCategories(category.id, 2);
};

// 选择二级分类
const selectSecondCategory = async (category: ProductCategory) => {
  selectedSecondCategory.value = category;
  selectedThirdCategory.value = null;

  // 加载三级分类
  await loadSubCategories(category.id, 3);

  // 如果有三级分类，自动选择第一个并加载商品
  if (thirdCategories.value.length > 0) {
    selectedThirdCategory.value = thirdCategories.value[0];
  }

  // 加载商品列表
  loadProductList(true);
};

// 选择三级分类
const selectThirdCategory = (category: ProductCategory) => {
  selectedThirdCategory.value = category;
  loadProductList(true);
};

// 加载子分类
const loadSubCategories = async (parentId: string, level: number) => {
  try {
    const res: any = await listSubCategories(parentId);
    console.log(res, 'res');

    if (res.code === 0 && res.data) {
      if (level === 2) {
        secondCategories.value = res.data;
        if (secondCategories.value.length > 0) {
          selectSecondCategory(secondCategories.value[0]);
        }
      } else if (level === 3) {
        thirdCategories.value = res.data;
      }
    }
  } catch (error) {
    console.error('加载子分类失败', error);
  }
};

// 加载商品列表
const loadProductList = async (reset = false) => {
  if (loading.value) return;

  if (reset) {
    pageNum.value = 1;
    products.value = [];
    hasMore.value = true;
  }

  if (!hasMore.value) return;

  loading.value = true;

  try {
    // 确定当前选中的分类ID
    const categoryId =
      selectedThirdCategory.value?.id ||
      selectedSecondCategory.value?.id ||
      selectedFirstCategory.value?.id;

    const res: any = await listProducts(
      pageNum.value,
      pageSize.value,
      categoryId,
      undefined,
      filter.value.sortBy
    );

    if (res.code === 0 && res.data) {
      const pageData: PageResponse<ProductListItem> = res.data;

      if (reset) {
        products.value = pageData.records;
      } else {
        products.value = [...products.value, ...pageData.records];
      }

      console.log(pageData, 'pageData');

      total.value = pageData.records.length;
      hasMore.value = pageNum.value < pageData.pages;

      // 如果还有更多数据，页码+1
      if (hasMore.value) {
        pageNum.value++;
      }
    }
  } catch (error) {
    console.error('加载商品列表失败', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  loadProductList(true);
};

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadProductList(false);
  }
};

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

// 切换排序菜单
const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value;
  showFilterPanel.value = false;
};

// 选择排序
const selectSort = (sortBy: string) => {
  filter.value.sortBy = sortBy as any;
  showSortMenu.value = false;
  loadProductList(true);
};

// 切换筛选面板
const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value;
  showSortMenu.value = false;
};

// 价格区间是否激活
const isPriceRangeActive = (range: any) => {
  return (
    filter.value.minPrice === range.min &&
    (range.max === undefined
      ? filter.value.maxPrice === undefined
      : filter.value.maxPrice === range.max)
  );
};

// 选择价格区间
const selectPriceRange = (range: any) => {
  filter.value.minPrice = range.min;
  filter.value.maxPrice = range.max;
  customMinPrice.value = '';
  customMaxPrice.value = '';
};

// 应用自定义价格
const applyCustomPrice = () => {
  const min = customMinPrice.value ? parseInt(customMinPrice.value) * 100 : undefined;
  const max = customMaxPrice.value ? parseInt(customMaxPrice.value) * 100 : undefined;

  if (min !== undefined && max !== undefined && min > max) {
    uni.showToast({
      title: '价格区间输入错误',
      icon: 'none',
    });
    return;
  }

  filter.value.minPrice = min;
  filter.value.maxPrice = max;
};

// 选择库存状态
const selectStockStatus = (status: any) => {
  filter.value.stockStatus = status;
};

// 应用筛选
const applyFilter = () => {
  showFilterPanel.value = false;
  loadProductList(true);
};

// 重置筛选
const resetFilter = () => {
  filter.value = {
    sortBy: 'comprehensive',
  };
  customMinPrice.value = '';
  customMaxPrice.value = '';
};

// 跳转到搜索页
const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/product/search-view',
  });
};

// 跳转到商品详情
const goToDetail = (productId: string) => {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`,
  });
};
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';
.category-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

// 搜索栏
.search-bar {
  padding: 20rpx;
  background-color: #fff;
}

.search-input {
  height: 64rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.icon-search {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.search-placeholder {
  color: #999;
  font-size: 28rpx;
}

// 一级分类导航
.first-category-nav {
  background-color: #fff;
  white-space: nowrap;
  border-bottom: 1px solid #eee;
}

.category-nav-list {
  display: inline-flex;
  padding: 0 20rpx;
}

.category-nav-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 24rpx;
  margin-right: 16rpx;

  &.active {
    .category-name {
      color: $primary-color;
      font-weight: bold;
    }
  }
}

.category-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 8rpx;
}

.category-name {
  font-size: 24rpx;
  color: #333;
}

// 内容容器
.content-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// 二级分类侧边栏
.second-category-sidebar {
  width: 180rpx;
  background-color: #f8f8f8;
}

.second-category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  background-color: #f8f8f8;
  border-right: 4rpx solid transparent;

  &.active {
    background-color: #fff;
    border-right-color: $primary-color;

    .category-name {
      color: $primary-color;
      font-weight: bold;
    }
  }
}

.category-icon-small {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 8rpx;
}

// 主内容区
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

// 三级分类
.third-category-list {
  border-bottom: 1px solid #eee;
  white-space: nowrap;
}

.third-category-items {
  display: inline-flex;
  padding: 16rpx 20rpx;
}

.third-category-item {
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: #666;

  &.active {
    background-color: $primary-color;
    color: #fff;
  }
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-bottom: 1px solid #eee;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;

  .arrow {
    margin-left: 8rpx;
    font-size: 20rpx;
    color: #999;
  }
}

.view-mode {
  width: 60rpx;
  text-align: center;
  font-size: 32rpx;
  color: #666;
}

// 排序菜单
.sort-menu {
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.sort-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  font-size: 28rpx;
  color: #333;

  &.active {
    color: #ff6b35;
  }

  .check {
    color: $primary-color;
    font-size: 32rpx;
  }
}

// 商品列表容器
.product-list-container {
  flex: 1;
}

.product-count {
  padding: 20rpx 32rpx;
  font-size: 24rpx;
  color: #999;
}

// 网格模式
.product-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;
}

.product-card-grid {
  width: calc(50% - 10rpx);
  margin: 0 10rpx 20rpx 0;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;

  &:nth-child(2n) {
    margin-right: 0;
  }

  .product-image {
    width: 100%;
    height: 340rpx;
    background-color: #f5f5f5;
  }

  .product-info {
    padding: 16rpx;
    position: relative;
  }

  .product-name {
    font-size: 26rpx;
    color: #333;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    line-height: 1.4;
    height: 72rpx;
  }

  .product-price-row {
    margin-top: 12rpx;
    display: flex;
    align-items: baseline;
  }

  .price {
    font-size: 32rpx;
    color: $primary-color;
    font-weight: bold;
  }

  .original-price {
    margin-left: 8rpx;
    font-size: 22rpx;
    color: #999;
    text-decoration: line-through;
  }

  .product-stats {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    font-size: 22rpx;
    color: #999;

    .sales {
      margin-right: 16rpx;
    }
  }

  .stock-tag {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    font-size: 20rpx;
    color: #fff;

    &.out-of-stock {
      background-color: #999;
    }

    &.low-stock {
      background-color: $primary-color;
    }
  }
}

// 加载状态
.loading-more,
.no-more {
  padding: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

// 空状态
.empty-state {
  padding: 120rpx 40rpx;
  text-align: center;

  .empty-icon {
    font-size: 120rpx;
    display: block;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

// 筛选面板
.filter-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.filter-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 560rpx;
  background-color: #fff;
  display: flex;
  flex-direction: column;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #eee;

  .filter-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .filter-reset {
    font-size: 28rpx;
    color: #ff6b35;
  }
}

.filter-content {
  flex: 1;
  padding: 0 32rpx;
}

.filter-section {
  margin-top: 40rpx;

  .filter-section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
  }
}

.price-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.price-option {
  padding: 12rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
  border: 2rpx solid transparent;

  &.active {
    background-color: #fff5f0;
    color: $primary-color;
    border-color: $primary-color;
  }
}

.price-custom {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;

  .price-input {
    flex: 1;
    height: 64rpx;
    padding: 0 16rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 24rpx;
  }

  .price-separator {
    color: #999;
  }

  .price-confirm {
    padding: 12rpx 32rpx;
    background-color: $primary-color;
    color: #fff;
    border-radius: 8rpx;
    font-size: 24rpx;
  }
}

.stock-options {
  display: flex;
  gap: 16rpx;
}

.stock-option {
  flex: 1;
  padding: 16rpx 24rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #666;
  text-align: center;
  border: 2rpx solid transparent;

  &.active {
    background-color: #fff5f0;
    color: $primary-color;
    border-color: $primary-color;
  }
}

.filter-footer {
  display: flex;
  padding: 24rpx 32rpx;
  border-top: 1px solid #eee;
  gap: 24rpx;

  .filter-cancel,
  .filter-confirm {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    font-size: 28rpx;
  }

  .filter-cancel {
    background-color: #f5f5f5;
    color: #666;
  }

  .filter-confirm {
    background-color: $primary-color;
    color: #fff;
  }
}

// 列表模式
.product-list {
  padding: 0 20rpx;
}

.product-card-list {
  display: flex;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;

  .product-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
    background-color: #f5f5f5;
    flex-shrink: 0;
  }

  .product-info {
    flex: 1;
    margin-left: 20rpx;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .product-name {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    line-height: 1.4;
  }

  .product-brand {
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #999;
  }

  .product-price-row {
    margin-top: auto;
    display: flex;
    align-items: baseline;
  }

  .price {
    font-size: 36rpx;
    color: $primary-color;
    font-weight: bold;
  }

  .original-price {
    margin-left: 12rpx;
    font-size: 24rpx;
    color: #999;
    text-decoration: line-through;
  }

  .product-stats {
    margin-top: 8rpx;
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: #999;

    .sales {
      margin-right: 24rpx;
    }
  }

  .stock-tag {
    position: absolute;
    top: 16rpx;
    right: 16rpx;
    padding: 4rpx 12rpx;
    border-radius: 4rpx;
    font-size: 20rpx;
    color: #fff;

    &.out-of-stock {
      background-color: #999;
    }

    &.low-stock {
      background-color: $primary-color;
    }
  }
}
</style>
