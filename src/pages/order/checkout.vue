<template>
  <view class="container">
    <view class="header">确认订单</view>

    <!-- 收货地址 -->
    <view class="section">
      <view class="section-title">收货地址</view>
      <view v-if="selectedAddress" class="address-box">
        <view class="address-content">
          <text class="receiver">
            {{ selectedAddress.receiverName }} {{ selectedAddress.receiverPhone }}
          </text>
          <text class="address">{{ selectedAddress.fullAddress }}</text>
        </view>
        <view class="address-change-btn">
          <button @click="changeAddress">更换</button>
        </view>
      </view>
      <button v-else class="btn-add-address" @click="changeAddress">添加收货地址</button>
    </view>

    <!-- 商品清单 -->
    <view class="section">
      <view class="section-title">商品清单</view>
      <view v-for="item in cartItems" :key="item.id" class="order-item">
        <image :src="item.mainImage" mode="aspectFill" />
        <view class="item-info">
          <view class="product-name">{{ item.productName }}</view>
          <view class="spec-info">{{ item.specInfo }}</view>
        </view>
        <view class="price">
          <text>¥{{ (item.price / 100).toFixed(2) }}</text>
          <text class="quantity">x{{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 配送方式 -->
    <view class="section">
      <view class="section-title">配送方式</view>
      <view class="option-group">
        <label
          v-for="method in shippingMethods"
          :key="method.id"
          class="option"
          :class="{ selected: shippingMethod === method.id }"
          @click="shippingMethod = method.id"
        >
          <radio
            :value="method.id"
            :checked="shippingMethod === method.id"
            @change="shippingMethod = method.id"
            color="#548163"
          />
          <view class="option-content">
            <text class="option-name">{{ method.name }}</text>
            <text class="fee" v-if="method.fee > 0">+¥{{ (method.fee / 100).toFixed(2) }}</text>
            <text class="fee free" v-else>免邮</text>
          </view>
        </label>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="section">
      <view class="section-title">支付方式</view>
      <view class="option-group">
        <label
          class="option"
          :class="{ selected: paymentMethod === 'weixin' }"
          @click="paymentMethod = 'weixin'"
        >
          <radio
            value="weixin"
            :checked="paymentMethod === 'weixin'"
            @change="paymentMethod = 'weixin'"
            color="#548163"
          />
          <view class="option-content">
            <text>微信支付</text>
          </view>
        </label>
        <label
          class="option"
          :class="{ selected: paymentMethod === 'alipay' }"
          @click="paymentMethod = 'alipay'"
        >
          <radio
            value="alipay"
            :checked="paymentMethod === 'alipay'"
            @change="paymentMethod = 'alipay'"
            color="#548163"
          />
          <view class="option-content">
            <text>支付宝</text>
          </view>
        </label>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="section">
      <view class="section-title">订单备注</view>
      <textarea v-model="remark" placeholder="请输入订单备注（可选）" maxlength="200" />
    </view>

    <!-- 金额明细 -->
    <view class="amount-detail">
      <view class="detail-row">
        <text>商品总价</text>
        <text>¥{{ (productAmount / 100).toFixed(2) }}</text>
      </view>
      <view class="detail-row">
        <text>配送费</text>
        <text>¥{{ (shippingFee / 100).toFixed(2) }}</text>
      </view>
      <view class="detail-row total">
        <text>实付款</text>
        <text>¥{{ (totalAmount / 100).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <button class="btn-submit" @click="submitOrder">提交订单</button>
  </view>
</template>

<script setup lang="ts">
import { createOrder } from '@/api/order';
import { useCartStore } from '@/stores/cart';
import type { Address } from '@/types/address/index';
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

const cartStore = useCartStore();
const selectedAddress = ref<any>(null);
const shippingMethod = ref('normal');
const paymentMethod = ref('weixin');
const remark = ref('');

const shippingMethods = [
  { id: 'normal', name: '标准快递', fee: 0 },
  { id: 'express', name: '次日达', fee: 1000 },
];

const cartItems = computed(() => cartStore.items.filter((i) => i.checked));
const productAmount = computed(() => cartStore.totalPrice);
const shippingFee = computed(() => {
  const method = shippingMethods.find((m) => m.id === shippingMethod.value);
  return method ? method.fee : 0;
});
const totalAmount = computed(() => productAmount.value + shippingFee.value);

onShow(() => {
  console.log(cartStore, 'cartStore');

  // 获取当前页（订单页）实例
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as {
    pageData?: Record<string, Address>; // 类型断言，避免 any 风险
  };

  // 读取地址页存入的数据（地址页已把数据存到订单页的 pageData）
  const selectedAddr = currentPage.pageData?.selectedAddress;
  if (selectedAddr) {
    selectedAddress.value = selectedAddr; // 赋值给响应式变量
    // 清空数据，避免下次进入重复读取（可选但推荐）
    if (currentPage.pageData) {
      currentPage.pageData.selectedAddress = null as any;
    }
  }
});

const changeAddress = () => {
  uni.navigateTo({ url: '/pages/user/address-list' });
};

const submitOrder = async () => {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'error' });
    return;
  }

  if (cartItems.value.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'error' });
    return;
  }

  try {
    // 请求订阅权限
    await requestSubscribeMessage();

    const orderData = {
      addressId: selectedAddress.value.id,
      items: cartItems.value.map((i) => ({
        productId: i.productId,
        skuId: i.skuId,
        quantity: i.quantity,
      })),
      shippingMethod: shippingMethod.value,
      paymentMethod: paymentMethod.value,
      remark: remark.value,
    };

    const res = await createOrder(orderData);
    cartStore.removeCheckedItems();
    uni.showToast({ title: '订单创建成功', icon: 'success' });
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/payment/payment?orderId=${res.data}`,
      });
    }, 500);
  } catch (e) {
    console.error('Failed to create order', e);
  }
};

const requestSubscribeMessage = async () => {
  try {
    const res = await uni.requestSubscribeMessage({
      tmplIds: ['d0sQiPZZa1vh3Hp6Q0N9FzXe1bDIEOFic8cv80Xv78E'],
    });
    console.log('订阅消息结果:', res);
    if (res['d0sQiPZZa1vh3Hp6Q0N9FzXe1bDIEOFic8cv80Xv78E'] === 'accept') {
      console.log('用户同意订阅');
      return true;
    } else if (res['d0sQiPZZa1vh3Hp6Q0N9FzXe1bDIEOFic8cv80Xv78E'] === 'reject') {
      console.log('用户拒绝订阅');
      return false;
    } else {
      console.log('用户关闭弹窗');
      return false;
    }
  } catch (e) {
    console.error('请求订阅消息失败', e);
    return false;
  }
};
</script>

<style scoped lang="scss">
.container {
  background: #f8f9ff;
  padding-bottom: 70px;
}

.header {
  padding: 16px;
  background: #548163;
  color: white;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(84, 129, 99, 0.2);
}

.section {
  margin: 12px 0;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.checkout-item:active {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
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

.address-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #548163;
  transition: all 0.3s ease;
  .address-change-btn {
    display: flex;
    align-items: flex-end;
    cursor: pointer;
  }
}

.address-box:active {
  background: #f0f1ff;
}

.address-content {
  display: flex;
  flex-direction: column;
}

.receiver {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.address {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.address-box button,
.btn-add-address {
  padding: 8px 16px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.address-box button:active,
.btn-add-address:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(84, 129, 99, 0.15);
}

.order-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.order-item:last-child {
  border-bottom: none;
}

image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  background: #f5f5f5;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spec-info {
  font-size: 12px;
  color: #999;
}

.price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.price text {
  color: #e74c3c;
  font-weight: bold;
  font-size: 14px;
}

.quantity {
  font-size: 12px;
  color: #999;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option.selected {
  background: #e8f4ef;
  border-color: #548163;
  box-shadow: 0 2px 6px rgba(84, 129, 99, 0.2);
}

.option:active {
  background: #f0f0f0;
  border-color: #548163;
}

.option-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

input[type='radio'] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.free {
  color: #548163;
  font-weight: bold;
}

.fee {
  margin-left: auto;
  color: #548163;
  font-weight: bold;
  font-size: 13px;
}

.fee {
  margin-left: auto;
  color: #548163;
  font-weight: bold;
  font-size: 13px;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fafafa;
  transition: all 0.3s ease;
  resize: none;
  line-height: 1.5;
}

textarea:focus {
  border-color: #548163;
  background: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(84, 129, 99, 0.1);
}

textarea::placeholder {
  color: #999;
}

.amount-detail {
  margin: 12px 0;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: #666;
}

.detail-row text:last-child {
  color: #333;
  font-weight: 500;
}

.detail-row.total {
  border-top: 2px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #e74c3c;
}

.detail-row.total text:last-child {
  color: #e74c3c;
}

.btn-submit {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 0;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 -2px 8px rgba(84, 129, 99, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-submit:active {
  opacity: 0.95;
}
</style>
