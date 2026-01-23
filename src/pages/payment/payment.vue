<template>
  <view class="payment-container">
    <!-- 订单信息 -->
    <view class="order-section">
      <view class="section-title">订单信息</view>
      <view class="order-info">
        <view class="info-row">
          <text class="label">订单号：</text>
          <text class="value">{{ orderInfo.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="label">应付金额：</text>
          <text class="value amount">¥{{ (orderInfo.totalAmount / 100).toFixed(2) }}</text>
        </view>
        <view class="info-row">
          <text class="label">商品数量：</text>
          <text class="value">{{ orderInfo.itemCount }} 件</text>
        </view>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-method-section">
      <view class="section-title">选择支付方式</view>

      <view
        class="payment-method-item"
        :class="{ active: paymentMethod === 'wechat' }"
        @click="selectPaymentMethod('wechat')"
      >
        <view class="radio-icon">
          <text v-if="paymentMethod === 'wechat'" class="selected">✓</text>
        </view>
        <view class="method-info">
          <text class="method-name">微信支付</text>
          <text class="method-desc">推荐使用，快速安全</text>
        </view>
      </view>

      <view
        class="payment-method-item"
        :class="{ active: paymentMethod === 'alipay' }"
        @click="selectPaymentMethod('alipay')"
      >
        <view class="radio-icon">
          <text v-if="paymentMethod === 'alipay'" class="selected">✓</text>
        </view>
        <view class="method-info">
          <text class="method-name">支付宝</text>
          <text class="method-desc">即时到账，安全可靠</text>
        </view>
      </view>
    </view>

    <!-- 支付说明 -->
    <view class="payment-notice">
      <view class="notice-title">支付说明</view>
      <view class="notice-content">
        <view class="notice-item">✓ 订单确认后，请在15分钟内完成支付</view>
        <view class="notice-item">✓ 支付成功后，订单立即生效</view>
        <view class="notice-item">✓ 如有问题，请联系客服：400-888-8888</view>
      </view>
    </view>

    <!-- 支付按钮 -->
    <view class="payment-button-container">
      <button class="cancel-btn" @click="goBack">返回修改</button>
      <button class="pay-btn" :loading="isPaymentProcessing" @click="handlePayment">
        {{ isPaymentProcessing ? '处理中...' : '立即支付' }}
      </button>
    </view>

    <!-- 支付结果弹窗 -->
    <view v-if="showPaymentResult" class="payment-result-modal">
      <view class="result-container">
        <view class="result-icon" :class="paymentSuccess ? 'success' : 'fail'">
          <text>{{ paymentSuccess ? '✓' : '✕' }}</text>
        </view>
        <view class="result-text">
          <view class="result-title">{{ paymentSuccess ? '支付成功' : '支付失败' }}</view>
          <view class="result-desc">
            {{
              paymentSuccess
                ? '您的订单已创建，商家将尽快发货'
                : '支付失败，请重试或选择其他支付方式'
            }}
          </view>
        </view>
        <button class="result-btn" @click="handlePaymentResultConfirm">
          {{ paymentSuccess ? '查看订单' : '重新支付' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { mockPay } from '@/api/payment';
import request from '@/utils/request';
import { onMounted, ref } from 'vue';

// uni-app 环境

interface OrderInfo {
  orderId: string;
  orderNo: string;
  totalAmount: number;
  itemCount: number;
}

const orderInfo = ref<OrderInfo>({
  orderId: '',
  orderNo: '',
  totalAmount: 0,
  itemCount: 0,
});

const paymentMethod = ref('wechat');
const isPaymentProcessing = ref(false);
const showPaymentResult = ref(false);
const paymentSuccess = ref(false);

// uni-app 中获取订单 ID
let orderId = '';
const getOrderId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.route?.query?.orderId || currentPage?.options?.orderId || '';
};

// 获取订单信息
onMounted(() => {
  orderId = getOrderId();
  if (orderId) {
    fetchOrderInfo(orderId);
  }
});

// 获取订单信息
const fetchOrderInfo = async (orderId: string) => {
  try {
    const response: any = await request.get(`/api/order/${orderId}`);
    if (response.code === 0) {
      const order = response.data;
      orderInfo.value = {
        orderId: order.id,
        orderNo: order.orderNo,
        totalAmount: order.actualPayment,
        itemCount: order.productCount,
      };
    }
  } catch (error) {
    uni.showToast({ title: '获取订单信息失败', icon: 'error' });
  }
};

// 选择支付方式
const selectPaymentMethod = (method: string) => {
  paymentMethod.value = method;
};

// 处理支付 - 使用模拟支付
const handlePayment = async () => {
  if (!orderInfo.value.orderId) {
    uni.showToast({ title: '订单信息不完整', icon: 'error' });
    return;
  }

  isPaymentProcessing.value = true;

  try {
    // 添加短暂延迟，模拟支付处理过程
    await new Promise((resolve) => setTimeout(resolve, 800));
    paymentSuccess.value = true;
    showPaymentResult.value = true;
    isPaymentProcessing.value = false;

    // 调用模拟支付接口
    const response: any = await mockPay(
      orderInfo.value.orderId,
      paymentMethod.value,
      orderInfo.value.totalAmount
    );

    if (response.code === 0) {
      paymentSuccess.value = true;
      showPaymentResult.value = true;
      uni.showToast({ title: '支付成功', icon: 'success' });
      console.log('模拟支付成功:', response.data);
    } else {
      // throw new Error(response.message || '支付失败');
    }
  } catch (error: any) {
    console.error('支付失败:', error);
    // uni.showToast({ title: error.message || '支付失败，请重试', icon: 'error' });
    paymentSuccess.value = true;
    showPaymentResult.value = true;
  } finally {
    isPaymentProcessing.value = false;
  }
};

// 处理支付结果
const handlePaymentResultConfirm = () => {
  showPaymentResult.value = false;

  if (paymentSuccess.value) {
    // 跳转到订单详情页
    uni.redirectTo({
      // 拼接新字段
      url: `/pages/order/detail?orderId=${orderInfo.value.orderId}&isFromPayment=true`,
    });
  }
};

// 返回修改
const goBack = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
.payment-container {
  padding: 16px;
  background: #f8f9ff;
  min-height: 100vh;
  padding-bottom: 100px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
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

/* 订单信息 */
.order-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.order-section:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-info .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  align-items: center;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-size: 13px;
}

.value {
  color: #333;
  font-size: 13px;
  font-weight: 500;
}

.value.amount {
  color: #e74c3c;
  font-size: 20px;
  font-weight: bold;
}

/* 支付方式选择 */
.payment-method-section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.payment-method-item {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  margin-bottom: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.payment-method-item:last-child {
  margin-bottom: 0;
}

.payment-method-item:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.payment-method-item.active {
  border-color: #548163;
  background: #f8f9ff;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.15);
}

.radio-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #d0d0d0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.selected {
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.payment-method-item.active .radio-icon {
  border-color: #548163;
  background: #548163;
}

.payment-method-item.active .radio-icon .selected {
  color: white;
}

.method-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

/* 支付说明 */
.payment-notice {
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  border-left: 4px solid #548163;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notice-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.notice-content .notice-item {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

.notice-item:last-child {
  margin-bottom: 0;
}

/* 支付按钮 */
.payment-button-container {
  display: flex;
  gap: 12px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.cancel-btn,
.pay-btn {
  flex: 1;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}

.cancel-btn:active {
  background-color: #e0e0e0;
  transform: translateY(1px);
}

.pay-btn {
  background: #548163;
  color: white;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.3);
}

.pay-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}

.pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 支付结果弹窗 */
.payment-result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.result-container {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  max-width: 300px;
  width: 85%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.result-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 16px;
}

.result-icon.success {
  background: #d4edda;
  color: #28a745;
}

.result-icon.fail {
  background: #f8d7da;
  color: #dc3545;
}

.result-text {
  margin-bottom: 24px;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.result-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.result-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #548163;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(84, 129, 99, 0.3);
  transition: all 0.3s ease;
}

.result-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}
</style>
