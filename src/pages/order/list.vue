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
          <text class="order-status" :class="`status-${order.status}`">{{
            getStatusText(order.status)
          }}</text>
        </view>

        <view class="order-items">
          <view v-for="item in order.items" :key="item.id" class="order-item">
            <image :src="item.mainImage" mode="aspectFill" />
            <view class="item-info">
              <view class="item-name">{{ item.productName }}</view>
              <view class="item-spec">{{ item.specInfo }}</view>
              <view class="item-bottom">
                <text class="item-price"
                  >¥{{ (item.price / 100).toFixed(2) }}</text
                >
                <text class="item-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <view class="order-total">
            共{{ order.items.length }}件商品 合计：
            <text class="total-price"
              >¥{{ (order.totalAmount / 100).toFixed(2) }}</text
            >
          </view>
          <view class="order-actions">
            <button
              v-if="order.status === 'PENDING'"
              class="btn-cancel"
              @click.stop="cancelOrder(order.id)"
            >
              取消订单
            </button>
            <button
              v-if="order.status === 'PENDING'"
              class="btn-pay"
              @click.stop="payOrder(order.id)"
            >
              去支付
            </button>
            <button
              v-if="order.status === 'SHIPPED'"
              class="btn-confirm"
              @click.stop="confirmReceipt(order.id)"
            >
              确认收货
            </button>
            <button
              v-if="order.status === 'SHIPPED'"
              class="btn-logistics"
              @click.stop="viewLogistics(order.id)"
            >
              查看物流
            </button>
            <button
              v-if="order.status === 'COMPLETED'"
              class="btn-evaluate"
              @click.stop="evaluate(order.id)"
            >
              评价
            </button>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading">加载中...</view>
      <view v-if="!hasMore && orderList.length > 0" class="no-more"
        >没有更多了</view
      >
      <view v-if="!loading && orderList.length === 0" class="empty">
        <text>暂无订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import request from "@/utils/request";

interface OrderItem {
  id: string;
  productName: string;
  price: number;
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

const currentStatus = ref("");
const orderList = ref<Order[]>([]);
const loading = ref(false);
const hasMore = ref(true);
const page = ref(1);

const tabs = ref([
  { label: "全部", status: "", count: 0 },
  { label: "待付款", status: "PENDING", count: 0 },
  { label: "待发货", status: "PAID", count: 0 },
  { label: "待收货", status: "SHIPPED", count: 0 },
  { label: "已完成", status: "COMPLETED", count: 0 },
]);

onMounted(() => {
  loadOrders();
});

const loadOrders = async () => {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const response = await request.get("/order/list", {
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
    console.error("加载订单失败", error);
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
    PENDING: "待付款",
    PAID: "待发货",
    SHIPPED: "待收货",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return statusMap[status] || "未知";
};

const goToOrderDetail = (orderId: string) => {
  uni.navigateTo({ url: `/pages/order/detail?orderId=${orderId}` });
};

const cancelOrder = (orderId: string) => {
  uni.showModal({
    title: "提示",
    content: "确定要取消订单吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.post(`/order/${orderId}/cancel`);
          if (response.code === 0) {
            uni.showToast({ title: "订单已取消", icon: "success" });
            orderList.value = [];
            page.value = 1;
            loadOrders();
          }
        } catch (error) {
          uni.showToast({ title: "取消失败", icon: "error" });
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
    title: "提示",
    content: "确认已收到货物吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.post(
            `/order/${orderId}/confirm-receipt`
          );
          if (response.code === 0) {
            uni.showToast({ title: "确认收货成功", icon: "success" });
            orderList.value = [];
            page.value = 1;
            loadOrders();
          }
        } catch (error) {
          uni.showToast({ title: "确认失败", icon: "error" });
        }
      }
    },
  });
};

const viewLogistics = (orderId: string) => {
  uni.navigateTo({ url: `/pages/logistics/detail?orderId=${orderId}` });
};

const evaluate = (orderId: string) => {
  uni.showToast({ title: "评价功能开发中", icon: "none" });
};
</script>

<style scoped lang="scss">
.order-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9ff;
}

.tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs .tab-item {
  flex: 1;
  position: relative;
  padding: 14px 0;
  text-align: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.tabs .tab-item.active {
  color: #548163;
  font-weight: 600;
  border-bottom: 3px solid #548163;
}

.tabs .tab-item .badge {
  position: absolute;
  top: 8px;
  right: 20px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  padding: 0 5px;
  background: #ff3b30;
  color: white;
  font-size: 10px;
  border-radius: 9px;
}

.order-scroll {
  flex: 1;
  padding: 12px;
}

.order-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.order-card .order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.order-card .order-header .order-no {
  font-size: 13px;
  color: #666;
}

.order-card .order-header .order-status {
  font-size: 13px;
  font-weight: 600;
}

.order-card .order-header .order-status.status-PENDING {
  color: #ff9500;
}

.order-card .order-header .order-status.status-PAID {
  color: #548163;
}

.order-card .order-header .order-status.status-SHIPPED {
  color: #00c853;
}

.order-card .order-header .order-status.status-COMPLETED {
  color: #999;
}

.order-card .order-header .order-status.status-CANCELLED {
  color: #999;
}

.order-card .order-items {
  padding: 12px 16px;
}

.order-card .order-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.order-card .order-item:last-child {
  margin-bottom: 0;
}

.order-card .order-item image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f0f0f0;
}

.order-card .order-item .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-card .order-item .item-info .item-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-card .order-item .item-info .item-spec {
  font-size: 12px;
  color: #999;
}

.order-card .order-item .item-info .item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-card .order-item .item-info .item-bottom .item-price {
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
}

.order-card .order-item .item-info .item-bottom .item-quantity {
  font-size: 13px;
  color: #999;
}

.order-card .order-footer {
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
}

.order-card .order-footer .order-total {
  font-size: 13px;
  color: #666;
  text-align: right;
  margin-bottom: 12px;
}

.order-card .order-footer .order-total .total-price {
  color: #e74c3c;
  font-size: 16px;
  font-weight: bold;
}

.order-card .order-footer .order-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.order-card .order-footer .order-actions button {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 13px;
  background: white;
  color: #666;
  cursor: pointer;
}

.order-card .order-footer .order-actions button:active {
  opacity: 0.8;
}

.order-card .order-footer .order-actions button.btn-cancel {
  color: #999;
}

.order-card .order-footer .order-actions button.btn-pay {
  background: #548163;
  color: white;
  border: none;
}

.order-card .order-footer .order-actions button.btn-confirm,
.order-card .order-footer .order-actions button.btn-logistics,
.order-card .order-footer .order-actions button.btn-evaluate {
  border-color: #548163;
  color: #548163;
}

.loading,
.no-more {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}
</style>
