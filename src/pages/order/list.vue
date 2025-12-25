<template>
  <view class="order-list">
    <!-- 顶部标签 -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.status"
        class="tab-item"
        :class="{ active: currentStatus === tab.status }"
        @click="changeTab(tab.status)"
      >
        {{ tab.label }}
        <view v-if="tab.count > 0" class="badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view class="order-scroll" scroll-y @scrolltolower="loadMore">
      <view
        v-for="order in orderList"
        :key="order.id"
        class="order-card"
        @click="goToOrderDetail(order.id)"
      >
        <view class="order-header">
          <text class="order-no">订单号：{{ order.orderNo }}</text>
          <text class="order-status" :class="`status-${order.status}`">
            {{ getStatusText(order.status) }}
          </text>
        </view>

        <view class="order-items">
          <view v-for="item in order.items" :key="item.id" class="order-item">
            <image :src="item.mainImage" mode="aspectFill" />
            <view class="item-info">
              <view class="item-name">{{ item.productName }}</view>
              <view class="item-spec">{{ item.specInfo }}</view>
              <view class="item-bottom">
                <text class="item-price">¥{{ (item.unitPrice / 100).toFixed(2) }}</text>
                <text class="item-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <view class="order-total">
            共{{ order.items.length }}件商品 合计：
            <text class="total-price">¥{{ (order.totalAmount / 100).toFixed(2) }}</text>
          </view>
          <view class="order-actions">
            <button
              v-if="order.status === 'pending_payment'"
              class="btn-cancel"
              @click.stop="cancelOrder(order.id)"
            >
              取消订单
            </button>
            <button
              v-if="order.status === 'pending_payment'"
              class="btn-pay"
              @click.stop="payOrder(order.id)"
            >
              去支付
            </button>
            <button
              v-if="order.status === 'pending_receipt'"
              class="btn-confirm"
              @click.stop="confirmReceipt(order.id)"
            >
              确认收货
            </button>
            <button
              v-if="order.status === 'pending_receipt'"
              class="btn-logistics"
              @click.stop="viewLogistics(order.id)"
            >
              查看物流
            </button>
            <button
              v-if="order.status === 'completed'"
              class="btn-evaluate"
              @click.stop="evaluate(order.id)"
            >
              评价
            </button>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="!hasMore && orderList.length > 0" class="no-more">没有更多了</view>
      <view v-if="!loading && orderList.length === 0" class="empty">
        <text>暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import request from '@/utils/request';
import { onMounted, ref } from 'vue';

interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  mainImage: string;
  specInfo: string;
}

interface Order {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createTime: string;
}

const currentStatus = ref('');
const orderList = ref<Order[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);

const tabs = ref([
  { label: '全部', status: '', count: 0 },
  { label: '待付款', status: 'pending_payment', count: 0 },
  { label: '待发货', status: 'pending_shipped', count: 0 },
  { label: '待收货', status: 'pending_receipt', count: 0 },
  { label: '已完成', status: 'completed', count: 0 },
  { label: '已取消', status: 'cancelled', count: 0 },
]);

onMounted(() => {
  loadOrders();
});

const loadOrders = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await request.get('/api/order/list', {
      params: {
        pageNum: page.value,
        pageSize: 10,
        status: currentStatus.value,
      },
    });

    if (response.code === 0) {
      const data = response.data;
      orderList.value.push(...data.records);
      page.value++;
      hasMore.value = data.records.length > 0;
    }
  } catch (error) {
    console.error('加载订单失败', error);
  } finally {
    loading.value = false;
  }
};

const changeTab = (status: string) => {
  currentStatus.value = status;
  page.value = 1;
  orderList.value = [];
  hasMore.value = true;
  loadOrders();
};

const loadMore = () => {
  loadOrders();
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_payment: '待付款',
    pending_shipped: '待发货',
    pending_receipt: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || '未知';
};

const goToOrderDetail = (orderId: string) => {
  uni.navigateTo({ url: `/pages/order/detail?orderId=${orderId}&isFromPayment=false` });
};

const cancelOrder = (orderId: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.post(`/api/order/${orderId}/cancel`);
          if (response.code === 0) {
            uni.showToast({ title: '订单已取消', icon: 'success' });
            orderList.value = [];
            page.value = 1;
            loadOrders();
          }
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'error' });
        }
      }
    },
  });
};

const payOrder = (orderId: string) => {
  uni.navigateTo({ url: `/pages/payment/payment?orderId=${orderId}` });
};

const confirmReceipt = (orderId: string) => {
  uni.showModal({
    title: '提示',
    content: '确认已收到货物吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.post(`/api/order/${orderId}/confirm-receipt`);
          if (response.code === 0) {
            uni.showToast({ title: '确认收货成功', icon: 'success' });
            orderList.value = [];
            page.value = 1;
            loadOrders();
          }
        } catch (error) {
          uni.showToast({ title: '确认失败', icon: 'error' });
        }
      }
    },
  });
};

const viewLogistics = (orderId: string) => {
  uni.navigateTo({ url: `/pages/logistics/detail?orderId=${orderId}` });
};

// TODO: 评价功能,报错
const evaluate = (orderId: string) => {
  uni.navigateTo({
    url: `/pages/logistics/evaluate?orderId=${orderId}`,
  });
};
</script>

<style scoped lang="scss">
/* 小程序样式重置 - 替换通配符选择器 */
page,
view,
text,
button,
input,
image,
navigator,
picker,
picker-view {
  box-sizing: border-box;
}

/* 主容器 */
.order-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  width: 100%;
  overflow-x: hidden;
}

/* 顶部标签栏 */
.tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
}

/* 标签项 */
.tabs .tab-item {
  flex: 1;
  min-width: 80px;
  position: relative;
  padding: 16px 0;
  text-align: center;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

/* 激活标签 */
.tabs .tab-item.active {
  color: #548163;
  font-weight: 700;
  border-bottom: 3px solid #548163;
}

/* 标签徽章 */
.tabs .tab-item .badge {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
  background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
  color: white;
  font-size: 11px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.3);
}

/* 订单滚动区域 */
.order-scroll {
  flex: 1;
  padding: 8px;
  width: 100%;
  overflow-x: hidden;
}

/* 订单卡片 */
.order-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  box-sizing: border-box;
}

/* 订单卡片点击效果 */
.order-card:active {
  transform: translateY(1px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

/* 订单头部 */
.order-card .order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  background: #fafafa;
}

/* 订单号 */
.order-card .order-header .order-no {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

/* 订单状态 */
.order-card .order-header .order-status {
  font-size: 14px;
  font-weight: 700;
}

/* 待付款状态 */
.order-card .order-header .order-status.status-pending_payment {
  color: #ff9500;
}

/* 待发货状态 */
.order-card .order-header .order-status.status-pending_shipped {
  color: #548163;
}

/* 待收货状态 */
.order-card .order-header .order-status.status-pending_receipt {
  color: #00c853;
}

/* 已完成状态 */
.order-card .order-header .order-status.status-completed {
  color: #999;
}

/* 已取消状态 */
.order-card .order-header .order-status.status-cancelled {
  color: #999;
}

/* 订单商品列表 */
.order-card .order-items {
  padding: 14px 16px;
}

/* 单个商品项 */
.order-card .order-item {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  align-items: flex-start;
}

/* 最后一个商品项 */
.order-card .order-item:last-child {
  margin-bottom: 0;
}

/* 商品图片 */
.order-card .order-item image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f0f0f0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 商品信息 */
.order-card .order-item .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;
}

/* 商品名称 */
.order-card .order-item .item-info .item-name {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 商品规格 */
.order-card .order-item .item-info .item-spec {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

/* 商品底部信息 */
.order-card .order-item .item-info .item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 商品价格 */
.order-card .order-item .item-info .item-bottom .item-price {
  font-size: 15px;
  color: #e74c3c;
  font-weight: 700;
}

/* 商品数量 */
.order-card .order-item .item-info .item-bottom .item-quantity {
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

/* 订单底部 */
.order-card .order-footer {
  padding: 14px 16px;
  border-top: 1px solid #f5f5f5;
  background: #fafafa;
}

/* 订单总计 */
.order-card .order-footer .order-total {
  font-size: 13px;
  color: #666;
  text-align: right;
  margin-bottom: 12px;
  font-weight: 500;
}

/* 总计价格 */
.order-card .order-footer .order-total .total-price {
  color: #e74c3c;
  font-size: 16px;
  font-weight: bold;
}

/* 订单操作按钮组 */
.order-card .order-footer .order-actions {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

/* 操作按钮基础样式 */
.order-card .order-footer .order-actions button {
  padding: 2px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 600;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 70px;
}

/* 按钮点击效果 */
.order-card .order-footer .order-actions button:active {
  transform: translateY(1px);
  opacity: 0.9;
}

/* 取消按钮 */
.order-card .order-footer .order-actions button.btn-cancel {
  color: #999;
  border-color: #e0e0e0;
}

/* 支付按钮 */
.order-card .order-footer .order-actions button.btn-pay {
  background: linear-gradient(135deg, #548163 0%, #456a52 100%);
  color: white;
  border: none;
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.3);
}

/* 确认收货、查看物流、评价按钮 */
.order-card .order-footer .order-actions button.btn-confirm,
.order-card .order-footer .order-actions button.btn-logistics,
.order-card .order-footer .order-actions button.btn-evaluate {
  border-color: #548163;
  color: #548163;
  margin: 0;
}

/* 加载中状态 */
.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
  font-weight: 500;
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
  font-size: 15px;
  text-align: center;
  font-weight: 500;
}

/* 空状态图标 */
.empty::before {
  content: '📋';
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>
