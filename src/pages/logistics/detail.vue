<template>
  <view class="logistics-detail">
    <!-- 顶部状态 -->
    <view class="status-card">
      <view class="status-icon">
        <text class="iconfont" :class="statusIconClass">&#xe63a;</text>
      </view>
      <view class="status-info">
        <text class="status-text">{{
          logisticsInfo?.statusDesc || "加载中..."
        }}</text>
        <text
          v-if="logisticsInfo?.tracks && logisticsInfo.tracks.length > 0"
          class="latest-desc"
        >
          {{ logisticsInfo.tracks[0].description }}
        </text>
      </view>
    </view>

    <!-- 物流信息 -->
    <view class="info-card">
      <view class="info-row">
        <text class="label">快递公司</text>
        <text class="value">{{ logisticsInfo?.courierCompany || "-" }}</text>
      </view>
      <view class="info-row">
        <text class="label">快递单号</text>
        <text class="value">{{ logisticsInfo?.trackingNo || "-" }}</text>
        <text class="copy-btn" @click="copyTrackingNo">复制</text>
      </view>
      <view class="info-row">
        <text class="label">收件人</text>
        <text class="value"
          >{{ logisticsInfo?.receiverName || "-" }}
          {{ logisticsInfo?.receiverPhone || "" }}</text
        >
      </view>
      <view class="info-row">
        <text class="label">收件地址</text>
        <text class="value">{{ logisticsInfo?.receiverAddress || "-" }}</text>
      </view>
    </view>

    <!-- 物流轨迹 -->
    <view class="track-card">
      <view class="card-title">物流轨迹</view>
      <view class="track-list">
        <view
          v-for="(track, index) in logisticsInfo?.tracks"
          :key="index"
          class="track-item"
          :class="{ latest: track.isLatest }"
        >
          <view class="track-dot"></view>
          <view
            class="track-line"
            v-if="index < logisticsInfo.tracks.length - 1"
          ></view>
          <view class="track-content">
            <view class="track-desc">{{ track.description }}</view>
            <view class="track-info">
              <text v-if="track.operateCity">{{ track.operateCity }}</text>
              <text v-if="track.operateLocation">{{
                track.operateLocation
              }}</text>
            </view>
            <view class="track-time">{{ formatTime(track.operateTime) }}</view>
            <view v-if="track.courierName" class="courier-info">
              快递员：{{ track.courierName }}
              <text v-if="track.courierPhone">{{ track.courierPhone }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions" v-if="logisticsInfo?.status === 'shipped'">
      <button class="action-btn primary" @click="confirmReceipt">
        确认收货
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getLogisticsDetail, type LogisticsDetail } from "@/api/logistics";
import { confirmReceipt as confirmReceiptApi } from "@/api/order";
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";

// 页面参数
const orderId = ref("");

// 物流信息
const logisticsInfo = ref<LogisticsDetail>();

// 状态图标类名
const statusIconClass = ref("icon-truck");

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
    uni.showLoading({ title: "加载中..." });
    const res = await getLogisticsDetail(orderId.value);
    logisticsInfo.value = res;

    // 根据状态设置图标
    updateStatusIcon(res.status);
  } catch (error: any) {
    uni.showToast({
      title: error.message || "加载失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
}

// 更新状态图标
function updateStatusIcon(status: string | undefined) {
  if (!status) return;
  const iconMap: Record<string, string> = {
    shipped: "icon-truck",
    transit: "icon-truck",
    delivering: "icon-deliver",
    signed: "icon-success",
    exception: "icon-warning",
  };
  statusIconClass.value = iconMap[status] || "icon-truck";
}

// 复制快递单号
function copyTrackingNo() {
  if (!logisticsInfo.value?.trackingNo) return;

  uni.setClipboardData({
    data: logisticsInfo.value.trackingNo,
    success: () => {
      uni.showToast({
        title: "已复制",
        icon: "success",
      });
    },
  });
}

// 确认收货
async function confirmReceipt() {
  try {
    await uni.showModal({
      title: "确认收货",
      content: "确认已收到商品?",
    });

    uni.showLoading({ title: "处理中..." });
    await confirmReceiptApi(orderId.value);

    uni.showToast({
      title: "确认成功",
      icon: "success",
    });

    // 刷新物流信息
    setTimeout(() => {
      loadLogisticsDetail();
    }, 1000);
  } catch (error: any) {
    if (error.cancel) return;
    uni.showToast({
      title: error.message || "操作失败",
      icon: "none",
    });
  } finally {
    uni.hideLoading();
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}
</script>

<style lang="scss" scoped>
.logistics-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx;
  display: flex;
  align-items: center;
  color: #fff;

  .status-icon {
    font-size: 80rpx;
    margin-right: 30rpx;
  }

  .status-info {
    flex: 1;

    .status-text {
      font-size: 36rpx;
      font-weight: bold;
      display: block;
      margin-bottom: 10rpx;
    }

    .latest-desc {
      font-size: 28rpx;
      opacity: 0.9;
    }
  }
}

.info-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;

  .info-row {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      font-size: 28rpx;
      color: #999;
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .copy-btn {
      font-size: 26rpx;
      color: #667eea;
      padding: 8rpx 20rpx;
      border: 1rpx solid #667eea;
      border-radius: 8rpx;
      margin-left: 20rpx;
    }
  }
}

.track-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }

  .track-list {
    .track-item {
      position: relative;
      padding-left: 50rpx;
      padding-bottom: 40rpx;

      &.latest {
        .track-dot {
          background: #667eea;
          width: 20rpx;
          height: 20rpx;
        }

        .track-desc {
          color: #667eea;
          font-weight: bold;
        }
      }

      .track-dot {
        position: absolute;
        left: 0;
        top: 8rpx;
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        background: #ddd;
      }

      .track-line {
        position: absolute;
        left: 7rpx;
        top: 28rpx;
        bottom: 0;
        width: 2rpx;
        background: #ddd;
      }

      .track-content {
        .track-desc {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
        }

        .track-info {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 4rpx;
        }

        .track-time {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 8rpx;
        }

        .courier-info {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

  .action-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;

    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
  }
}
</style>
