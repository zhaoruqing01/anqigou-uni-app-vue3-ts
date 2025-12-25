<template>
  <view class="logistics-evaluate">
    <!-- 物流信息卡片 -->
    <view class="logistics-card">
      <view class="card-title">物流信息</view>
      <view class="info-row">
        <text class="label">快递公司</text>
        <text class="value">{{ logisticsInfo?.courierCompany || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="label">快递单号</text>
        <text class="value">{{ logisticsInfo?.trackingNo || '-' }}</text>
      </view>
    </view>

    <!-- 评价表单 -->
    <view class="evaluate-form">
      <!-- 物流速度 -->
      <view class="form-item">
        <view class="item-title">
          <text>物流速度</text>
          <text class="required">*</text>
        </view>
        <view class="star-rating">
          <text
            v-for="star in 5"
            :key="`speed-${star}`"
            class="star"
            :class="{ active: star <= speedRating }"
            @click="setRating('speed', star)"
          >
            ★
          </text>
        </view>
        <text class="rating-desc">{{ getRatingDesc(speedRating) }}</text>
      </view>

      <!-- 快递员服务 -->
      <view class="form-item">
        <view class="item-title">
          <text>快递员服务</text>
          <text class="required">*</text>
        </view>
        <view class="star-rating">
          <text
            v-for="star in 5"
            :key="`service-${star}`"
            class="star"
            :class="{ active: star <= serviceRating }"
            @click="setRating('service', star)"
          >
            ★
          </text>
        </view>
        <text class="rating-desc">{{ getRatingDesc(serviceRating) }}</text>
      </view>

      <!-- 商品完好度 -->
      <view class="form-item">
        <view class="item-title">
          <text>商品完好度</text>
          <text class="required">*</text>
        </view>
        <view class="star-rating">
          <text
            v-for="star in 5"
            :key="`quality-${star}`"
            class="star"
            :class="{ active: star <= qualityRating }"
            @click="setRating('quality', star)"
          >
            ★
          </text>
        </view>
        <text class="rating-desc">{{ getRatingDesc(qualityRating) }}</text>
      </view>

      <!-- 评价内容 -->
      <view class="form-item">
        <view class="item-title">
          <text>评价内容</text>
          <text class="optional">(选填)</text>
        </view>
        <textarea
          v-model="content"
          class="textarea"
          placeholder="说说您对本次物流服务的评价吧～"
          :maxlength="200"
        />
        <text class="char-count">{{ content.length }}/200</text>
      </view>

      <!-- 匿名评价 -->
      <view class="form-item">
        <view class="anonymous-row">
          <text>匿名评价</text>
          <switch :checked="isAnonymous" @change="toggleAnonymous" color="#667eea" />
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" @click="submitEvaluation" :disabled="submitting">
        {{ submitting ? '提交中...' : '提交评价' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getLogisticsDetail, type LogisticsDetail } from '@/api/logistics';
import request from '@/utils/request';
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';

// 页面参数
const orderId = ref('');
const logisticsId = ref('');

// 物流信息
const logisticsInfo = ref<LogisticsDetail>();

// 评分
const speedRating = ref(5);
const serviceRating = ref(5);
const qualityRating = ref(5);

// 评价内容
const content = ref('');

// 匿名评价
const isAnonymous = ref(false);

// 提交状态
const submitting = ref(false);

// 页面加载
onLoad((options) => {
  if (options?.orderId) {
    orderId.value = options.orderId as string;
    loadLogisticsDetail();
  }
});

// 加载物流详情
async function loadLogisticsDetail() {
  try {
    const res = await getLogisticsDetail(orderId.value);
    logisticsInfo.value = res;
    logisticsId.value = res.id;

    // 检查是否已评价
    if (res.hasEvaluated) {
      uni.showModal({
        title: '提示',
        content: '您已评价过该物流',
        showCancel: false,
        success: () => {
          uni.navigateBack();
        },
      });
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    });
  }
}

// 设置评分
function setRating(type: 'speed' | 'service' | 'quality', rating: number) {
  if (type === 'speed') {
    speedRating.value = rating;
  } else if (type === 'service') {
    serviceRating.value = rating;
  } else if (type === 'quality') {
    qualityRating.value = rating;
  }
}

// 获取评分描述
function getRatingDesc(rating: number): string {
  const descMap: Record<number, string> = {
    1: '非常不满意',
    2: '不满意',
    3: '一般',
    4: '满意',
    5: '非常满意',
  };
  return descMap[rating] || '';
}

// 切换匿名
function toggleAnonymous(e: any) {
  isAnonymous.value = e.detail.value;
}

// 提交评价
async function submitEvaluation() {
  // 验证评分
  if (speedRating.value === 0 || serviceRating.value === 0 || qualityRating.value === 0) {
    uni.showToast({
      title: '请完成所有评分',
      icon: 'none',
    });
    return;
  }

  if (submitting.value) return;

  try {
    submitting.value = true;
    uni.showLoading({ title: '提交中...' });

    // 调用评价接口
    await request({
      url: `/api/logistics/${logisticsId.value}/evaluate`,
      method: 'POST',
      data: {
        speedRating: speedRating.value,
        serviceRating: serviceRating.value,
        qualityRating: qualityRating.value,
        content: content.value || '',
        images: '',
        isAnonymous: isAnonymous.value ? 1 : 0,
      },
    });

    uni.hideLoading();
    uni.showToast({
      title: '评价成功',
      icon: 'success',
    });

    // 延迟返回
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error: any) {
    uni.hideLoading();
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none',
    });
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/common.scss';
.logistics-evaluate {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.logistics-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .info-row {
    display: flex;
    align-items: center;
    padding: 16rpx 0;

    .label {
      width: 160rpx;
      font-size: 28rpx;
      color: #666;
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.evaluate-form {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .form-item {
    margin-bottom: 40rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .item-title {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: flex;
      align-items: center;

      .required {
        color: #ff4d4f;
        margin-left: 4rpx;
      }

      .optional {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
      }
    }

    .star-rating {
      display: flex;
      gap: 16rpx;
      margin-bottom: 12rpx;

      .star {
        font-size: 60rpx;
        color: #ddd;
        transition: all 0.3s ease;
        cursor: pointer;

        &.active {
          color: #ffd700;
          transform: scale(1.1);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }

    .rating-desc {
      font-size: 24rpx;
      color: #999;
    }

    .textarea {
      width: 100%;
      min-height: 200rpx;
      padding: 20rpx;
      font-size: 28rpx;
      color: #333;
      background: #f8f8f8;
      border-radius: 12rpx;
      border: none;
      box-sizing: border-box;
    }

    .char-count {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }

    .anonymous-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.submit-section {
  padding: 20rpx;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    // 使用主题色
    background: $primary-color;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 44rpx;
    border: none;
    box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;

    &:active:not([disabled]) {
      transform: scale(0.98);
      box-shadow: 0 2rpx 5rpx rgba(102, 126, 234, 0.3);
    }

    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
