<template>
  <view class="order-detail">
    <!-- 订单状态 -->
    <view class="order-status-section">
      <view class="status-icon" :class="`status-${orderInfo.status}`">
        {{ getStatusIcon() }}
      </view>
      <view class="status-text">{{ getStatusText(orderInfo.status) }}</view>
      <view class="status-desc">{{ getStatusDesc(orderInfo.status) }}</view>
    </view>

    <!-- 收货信息 -->
    <view class="section">
      <view class="section-title">收货信息</view>
      <view class="address-info">
        <view class="receiver">{{ orderInfo.receiverName }} {{ orderInfo.receiverPhone }}</view>
        <view class="address">{{ orderInfo.receiverAddress }}</view>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="section">
      <view class="section-title">商品信息</view>
      <view class="order-items">
        <view v-for="item in orderInfo.items" :key="item.id" class="order-item">
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
    </view>

    <!-- 订单信息 -->
    <view class="section">
      <view class="section-title">订单信息</view>
      <view class="order-info">
        <view class="info-row">
          <text class="label">订单编号：</text>
          <text class="value">{{ orderInfo.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="label">下单时间：</text>
          <text class="value">{{ formatTime(orderInfo.createTime) }}</text>
        </view>
        <view class="info-row">
          <text class="label">支付方式：</text>
          <text class="value">{{ getPaymentMethodText(orderInfo.paymentMethod) }}</text>
        </view>
        <view class="info-row">
          <text class="label">配送方式：</text>
          <text class="value">{{ getShippingMethodText(orderInfo.shippingMethod) }}</text>
        </view>
      </view>
    </view>

    <!-- 金额明细 -->
    <view class="section">
      <view class="section-title">金额明细</view>
      <view class="amount-detail">
        <view class="detail-row">
          <text>商品总价</text>
          <text>¥{{ (orderInfo.productAmount / 100).toFixed(2) }}</text>
        </view>
        <view class="detail-row">
          <text>配送费</text>
          <text>¥{{ (orderInfo.shippingFee / 100).toFixed(2) }}</text>
        </view>
        <view class="detail-row total">
          <text>实付款</text>
          <text class="total-price">¥{{ (orderInfo.totalAmount / 100).toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button v-if="orderInfo.status === 'pending_receipt'" class="btn-cancel" @click="cancelOrder">
        取消订单
      </button>
      <!-- <button v-if="orderInfo.status === 'pending_receipt'" class="btn-pay" @click="payOrder">
        去支付
      </button> -->
      <button
        v-if="orderInfo.status === 'pending_receipt'"
        class="btn-confirm"
        @click="confirmReceipt"
      >
        确认收货
      </button>
      <button
        v-if="orderInfo.status === 'pending_receipt'"
        class="btn-logistics"
        @click="viewLogistics"
      >
        查看物流
      </button>
      <button v-if="orderInfo.status === 'completed'" class="btn-evaluate" @click="evaluateOrder">
        评价
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import request from '@/utils/request';
import { onBackPress } from '@dcloudio/uni-app';
import { onMounted, ref } from 'vue';

// 监听返回按钮事件，根据isFromPayment参数决定返回到首页还是上一页
onBackPress(() => {
  customNavigateBack();
  return true; // 阻止默认的返回行为
});

interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  mainImage: string;
  specInfo: string;
}

interface OrderInfo {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  productAmount: number;
  shippingFee: number;
  paymentMethod: string;
  shippingMethod: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  createTime: string;
  items: OrderItem[];
}

const orderInfo = ref<OrderInfo>({
  id: '',
  orderNo: '',
  status: 'pending_receipt',
  totalAmount: 0,
  productAmount: 0,
  shippingFee: 0,
  paymentMethod: 'weixin',
  shippingMethod: 'normal',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  createTime: '',
  items: [],
});

const isFromPayment = ref(false);

onMounted(() => {
  const orderId = getOrderId();
  if (orderId) {
    loadOrderDetail(orderId);
  }
  // 若isFromPayment参数为true，则返回上一级改为返回到主页面,若为false则返回到上一页
  isFromPayment.value = getisFromPayment();
  console.log(isFromPayment.value, 'isFromPayment');
});

const getOrderId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.orderId || '';
};

const getisFromPayment = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.isFromPayment || '';
};

const loadOrderDetail = async (orderId: string) => {
  try {
    const response = await request.get(`/api/order/${orderId}`);
    if (response.code === 0) {
      orderInfo.value = response.data;
    }
  } catch (error) {
    console.error('加载订单详情失败', error);
    uni.showToast({ title: '加载订单详情失败', icon: 'error' });
  }
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending_payment: '等待付款',
    pending_shipped: '等待发货',
    pending_receipt: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || '未知状态';
};

const getStatusDesc = (status: string) => {
  const descMap: Record<string, string> = {
    pending_payment: '请尽快完成支付',
    pending_shipped: '商家正在备货中',
    pending_receipt: '商品正在运输中',
    completed: '感谢您的购买',
    cancelled: '订单已取消',
  };
  return descMap[status] || '';
};

const getStatusIcon = () => {
  const iconMap: Record<string, string> = {
    pending_payment: '💳',
    pending_shipped: '📦',
    pending_receipt: '🚚',
    completed: '✅',
    cancelled: '❌',
  };
  return iconMap[orderInfo.value.status] || '❓';
};

const getPaymentMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    weixin: '微信支付',
    alipay: '支付宝',
  };
  return methodMap[method] || '未知支付方式';
};

const getShippingMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    normal: '标准快递',
    express: '次日达',
  };
  return methodMap[method] || '标准快递';
};

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN');
};

const cancelOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.post(`/api/order/${orderInfo.value.id}/cancel`);
          if (response.code === 0) {
            uni.showToast({ title: '订单已取消', icon: 'success' });
            customNavigateBack();
          }
        } catch (error) {
          uni.showToast({ title: '取消失败', icon: 'error' });
        }
      }
    },
  });
};

const confirmReceipt = () => {
  uni.showModal({
    title: '提示',
    content: '确认已收到货物吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.post(`/api/order/${orderInfo.value.id}/confirm-receipt`);
          // @ts-ignore
          if (response.code === 0) {
            uni.showToast({ title: '确认收货成功', icon: 'success' });
            // 刷新订单信息
            const orderId = orderInfo.value.id;
            await loadOrderDetail(orderId);
          }
        } catch (error) {
          uni.showToast({ title: '确认失败', icon: 'error' });
        }
      }
    },
  });
};

const viewLogistics = () => {
  uni.navigateTo({
    url: `/pages/logistics/detail?orderId=${orderInfo.value.id}`,
  });
};

const evaluateOrder = () => {
  // 跳转到物流评价页面
  uni.navigateTo({
    url: `/pages/logistics/evaluate?orderId=${orderInfo.value.id}`,
  });
};

// 自定义返回函数，根据isFromPayment参数决定返回到首页还是上一页
const customNavigateBack = () => {
  if (isFromPayment.value) {
    // 如果是从支付页面跳转过来的，返回到首页
    uni.reLaunch({
      url: '/pages/index/index',
    });
  } else {
    // 否则返回上一页
    uni.navigateBack();
  }
};
</script>

<style scoped lang="scss">
.order-detail {
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  min-height: 100vh;
  padding-bottom: 80px;
}

.order-status-section {
  background: white;
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 12px;
}

.order-status-section .status-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.order-status-section .status-icon.status-pending_receipt {
  color: #ff9500;
}

.order-status-section .status-icon.status-pending_shipped {
  color: #548163;
}

.order-status-section .status-icon.status-pending_receipt {
  color: #00c853;
}

.order-status-section .status-icon.status-completed {
  color: #00c853;
}

.order-status-section .status-icon.status-cancelled {
  color: #999;
}

.order-status-section .status-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.order-status-section .status-desc {
  font-size: 14px;
  color: #666;
}

.section {
  background: white;
  border-radius: 12px;
  margin: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.section-title:before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #548163;
  border-radius: 2px;
  margin-right: 8px;
}

.address-info .receiver {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.address-info .address {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.order-items .order-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.order-items .order-item:last-child {
  border-bottom: none;
}

.order-items .order-item image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f0f0f0;
}

.order-items .order-item .item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.order-items .order-item .item-info .item-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-items .order-item .item-info .item-spec {
  font-size: 12px;
  color: #999;
}

.order-items .order-item .item-info .item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-items .order-item .item-info .item-bottom .item-price {
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
}

.order-items .order-item .item-info .item-bottom .item-quantity {
  font-size: 13px;
  color: #999;
}

.order-info .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
}

.order-info .info-row:last-child {
  margin-bottom: 0;
}

.order-info .info-row .label {
  color: #666;
}

.order-info .info-row .value {
  color: #333;
  text-align: right;
}

.amount-detail .detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: #666;
}

.amount-detail .detail-row.total {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.amount-detail .detail-row.total .total-price {
  color: #e74c3c;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  gap: 12px;
}

.action-bar button {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: white;
  cursor: pointer;
}

.action-bar button:active {
  opacity: 0.8;
}

.action-bar button.btn-cancel {
  color: #999;
  border-color: #ddd;
}

.action-bar button.btn-pay {
  background: #548163;
  color: white;
  border: none;
}

.action-bar button.btn-confirm,
.action-bar button.btn-logistics {
  border-color: #548163;
  color: #548163;
}

.action-bar button.btn-evaluate {
  border-color: #00c853;
  color: #00c853;
}
</style>
