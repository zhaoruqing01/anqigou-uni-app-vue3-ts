<template>
  <view class="logistics-detail">
    <!-- 顶部状态 -->
    <view class="status-card">
      <view class="status-icon">
        <text class="iconfont" :class="statusIconClass">🚚</text>
      </view>
      <view class="status-info">
        <text class="status-text">{{ logisticsInfo?.statusDesc || '加载中...' }}</text>
        <text v-if="logisticsInfo?.tracks && logisticsInfo.tracks.length > 0" class="latest-desc">
          {{ logisticsInfo.tracks[0].description }}
        </text>
        <view class="refresh-info" v-if="autoRefreshEnabled">
          <text class="refresh-text">自动刷新中...</text>
          <text class="refresh-count">{{ refreshCount }}秒后刷新</text>
        </view>
      </view>
    </view>

    <!-- 物流信息 -->
    <view class="info-card">
      <view class="info-row">
        <text class="label">快递公司</text>
        <text class="value">{{ logisticsInfo?.courierCompany || '-' }}</text>
      </view>
      <view class="info-row">
        <text class="label">快递单号</text>
        <text class="value">{{ logisticsInfo?.trackingNo || '-' }}</text>
        <text class="copy-btn" @click="copyTrackingNo">复制</text>
      </view>
      <view class="info-row">
        <text class="label">收件人</text>
        <text class="value">
          {{ logisticsInfo?.receiverName || '-' }} {{ logisticsInfo?.receiverPhone || '' }}
        </text>
      </view>
      <view class="info-row">
        <text class="label">收件地址</text>
        <text class="value">{{ logisticsInfo?.receiverAddress || '-' }}</text>
      </view>
    </view>

    <!-- 地图轨迹 -->
    <view class="map-card" v-if="showMap && logisticsInfo?.tracks?.length > 0">
      <view class="card-title">
        <text>地图轨迹</text>
        <text class="action-btn" @click="toggleMap">{{ showMap ? '收起' : '展开' }}</text>
      </view>
      <map
        v-if="logisticsInfo?.tracks?.length > 0"
        :longitude="longitude"
        :latitude="latitude"
        :markers="markers"
        :polyline="polyline"
        :scale="13"
        style="width: 100%; height: 400rpx"
        show-location
      ></map>
      <view v-else class="map-loading">
        <text class="loading-text">暂无地图数据</text>
      </view>
    </view>

    <!-- 物流轨迹 -->
    <view class="track-card">
      <view class="card-title">
        <text>物流轨迹</text>
        <view class="card-actions">
          <text class="action-btn" @click="toggleAutoRefresh">
            {{ autoRefreshEnabled ? '关闭自动刷新' : '开启自动刷新' }}
          </text>
        </view>
      </view>
      <view class="track-list">
        <view
          v-for="(track, index) in logisticsInfo?.tracks"
          :key="index"
          class="track-item"
          :class="{ latest: track.isLatest }"
        >
          <view class="track-dot"></view>
          <view class="track-line" v-if="index < logisticsInfo.tracks.length - 1"></view>
          <view class="track-content">
            <view class="track-desc">{{ track.description }}</view>
            <view class="track-info">
              <text v-if="track.operateCity">{{ track.operateCity }}</text>
              <text v-if="track.operateLocation">{{ track.operateLocation }}</text>
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
      <button class="action-btn primary" @click="confirmReceipt">确认收货</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getLogisticsDetail, type LogisticsDetail } from '@/api/logistics';
import { confirmReceipt as confirmReceiptApi } from '@/api/order';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { ref } from 'vue';

// 页面参数
const orderId = ref('');

// 物流信息
const logisticsInfo = ref<LogisticsDetail>();

// 状态图标类名
const statusIconClass = ref('icon-truck');

// 地图相关
const showMap = ref(true);
const longitude = ref(116.397428); // 默认经度
const latitude = ref(39.90923); // 默认纬度
const markers = ref<any[]>([]);
const polyline = ref<any[]>([]);

// 自动刷新相关
const autoRefreshEnabled = ref(true);
const refreshCount = ref(60); // 60秒刷新一次
let refreshTimer: number | null = null;
let countTimer: number | null = null;

// 物流单号和快递公司由后端返回

// 详细地点经纬度映射（更精细的坐标）
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  // 深圳市
  深圳市: [114.057868, 22.543099],
  广东省深圳市南山区科技园A栋101室: [113.938533, 22.541668],
  广东省深圳市南山区科技园配送点: [113.940121, 22.542317],
  广东省深圳市南山区科技园顺丰网点: [113.939245, 22.543128],
  广东省深圳市宝安区顺丰华南转运中心: [113.837115, 22.647108],
  广东省深圳市宝安区顺丰华南转运中心分拣区: [113.836542, 22.647531],

  // 上海市
  上海市: [121.473701, 31.230416],
  上海市浦东新区陆家嘴世纪大道100号: [121.493388, 31.237185],
  上海市浦东新区陆家嘴世纪大道100号B栋501室: [121.493452, 31.237241],
  上海市浦东新区陆家嘴顺丰配送网点: [121.492876, 31.236957],
  上海市青浦区顺丰华东转运中心: [121.137725, 31.136304],
  上海市青浦区顺丰华东转运中心分拣区: [121.138143, 31.136728],

  // 默认城市坐标
  广州市: [113.280637, 23.125178],
  武汉市: [114.305393, 30.59285],
  北京市: [116.397428, 39.90923],
  杭州市: [120.15507, 30.274085],
  成都市: [104.066541, 30.572269],
  重庆市: [106.551556, 29.563009],
  郑州市: [113.625368, 34.746599],
  南京市: [118.796877, 32.060255],
};

// 计算地图轨迹
function calculateMapTrack() {
  if (!logisticsInfo.value?.tracks || logisticsInfo.value.tracks.length === 0) {
    return;
  }

  const tracks = logisticsInfo.value.tracks;
  const coords: [number, number][] = [];
  const trackMarkers: any[] = [];

  // 遍历轨迹，生成坐标点
  tracks.forEach((track, index) => {
    let lng = 0;
    let lat = 0;
    let hasCoords = false;

    // 1. 优先使用详细地点的经纬度
    if (track.operateLocation) {
      // 组合完整地址
      const fullAddress = `${track.operateCity}${track.operateLocation}`;
      // 查找详细地点的经纬度
      const locationCoords =
        LOCATION_COORDINATES[fullAddress] ||
        LOCATION_COORDINATES[track.operateLocation] ||
        LOCATION_COORDINATES[track.operateCity];
      if (locationCoords) {
        lng = locationCoords[0];
        lat = locationCoords[1];
        hasCoords = true;
      }
    }
    // 2. 最后使用城市的经纬度
    else if (track.operateCity) {
      const cityCoords = LOCATION_COORDINATES[track.operateCity];
      if (cityCoords) {
        lng = cityCoords[0];
        lat = cityCoords[1];
        hasCoords = true;
      }
    }

    // 3. 如果还是找不到坐标，使用默认坐标
    if (!hasCoords) {
      // 使用默认坐标（深圳）
      lng = 113.938533;
      lat = 22.541668;
      hasCoords = true;
    }

    if (hasCoords) {
      coords.push([lng, lat]);
      trackMarkers.push({
        id: index,
        longitude: lng,
        latitude: lat,
        title: track.operateLocation || track.operateCity,
        // 使用微信小程序内置标记点样式
        type: index === 0 ? 1 : 0, // 0: 默认标记点，1: 红色标记点
        width: 30,
        height: 30,
        callout: {
          content: track.description,
          color: '#333',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#fff',
          padding: 6,
          display: 'BYCLICK',
        },
      });
    }
  });

  // 设置地图中心点（使用最新的轨迹点）
  if (coords.length > 0) {
    const latestCoords = coords[0]; // 最新的轨迹点在第一个
    longitude.value = latestCoords[0];
    latitude.value = latestCoords[1];
  }

  // 设置标记点
  markers.value = trackMarkers;

  // 设置路线（按时间顺序从旧到新绘制）
  if (coords.length > 1) {
    polyline.value = [
      {
        points: coords.map(([lng, lat]) => ({ longitude: lng, latitude: lat })),
        color: '#548163', // 使用主题色
        width: 4,
        dottedLine: false,
      },
    ];
  } else {
    polyline.value = [];
  }
}

// 切换地图显示
function toggleMap() {
  showMap.value = !showMap.value;
}

// 页面加载
onLoad((options) => {
  if (options?.orderId) {
    orderId.value = options.orderId as string;
    loadLogisticsDetail();
    startAutoRefresh();
  }
});

// 页面卸载时清理定时器
onUnload(() => {
  stopAutoRefresh();
});

// 加载物流详情
async function loadLogisticsDetail() {
  try {
    uni.showLoading({ title: '加载中...' });
    // 从本地接口获取物流基本信息
    const res = await getLogisticsDetail(orderId.value);
    logisticsInfo.value = res;

    // 根据状态设置图标
    updateStatusIcon(res.status);

    // 计算地图轨迹
    calculateMapTrack();

    // 重置刷新计数
    refreshCount.value = 60;
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    });
  } finally {
    uni.hideLoading();
  }
}

// 更新状态图标
function updateStatusIcon(status: string | undefined) {
  if (!status) return;
  const iconMap: Record<string, string> = {
    shipped: 'icon-truck',
    transit: 'icon-truck',
    delivering: 'icon-deliver',
    signed: 'icon-success',
    exception: 'icon-warning',
  };
  statusIconClass.value = iconMap[status] || 'icon-truck';
}

// 复制快递单号
function copyTrackingNo() {
  if (!logisticsInfo.value?.trackingNo) return;

  uni.setClipboardData({
    data: logisticsInfo.value.trackingNo,
    success: () => {
      uni.showToast({
        title: '已复制',
        icon: 'success',
      });
    },
  });
}

// 确认收货
async function confirmReceipt() {
  try {
    await uni.showModal({
      title: '确认收货',
      content: '确认已收到商品?',
      success: (res) => {
        if (res.confirm) {
          // 用户确认后执行确认收货操作
          doConfirmReceipt();
        }
      },
    });
  } catch (error: any) {
    if (error.cancel) return;
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none',
    });
  }
}

// 执行确认收货
async function doConfirmReceipt() {
  try {
    uni.showLoading({ title: '处理中...' });
    await confirmReceiptApi(orderId.value);

    uni.showToast({
      title: '确认成功',
      icon: 'success',
    });

    // 刷新物流信息
    setTimeout(() => {
      loadLogisticsDetail();
    }, 1000);
  } catch (error: any) {
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none',
    });
  } finally {
    uni.hideLoading();
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 切换自动刷新
function toggleAutoRefresh() {
  autoRefreshEnabled.value = !autoRefreshEnabled.value;
  if (autoRefreshEnabled.value) {
    startAutoRefresh();
    uni.showToast({
      title: '自动刷新已开启',
      icon: 'success',
      duration: 1500,
    });
  } else {
    stopAutoRefresh();
    uni.showToast({
      title: '自动刷新已关闭',
      icon: 'success',
      duration: 1500,
    });
  }
}

// 开始自动刷新
function startAutoRefresh() {
  stopAutoRefresh();

  // 刷新倒计时
  countTimer = setInterval(() => {
    if (refreshCount.value > 0) {
      refreshCount.value--;
    }
  }, 1000) as unknown as number;

  // 自动刷新
  refreshTimer = setInterval(() => {
    loadLogisticsDetail();
  }, 60000) as unknown as number;
}

// 停止自动刷新
function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  if (countTimer) {
    clearInterval(countTimer);
    countTimer = null;
  }
  refreshCount.value = 60;
}
</script>

<style lang="scss" scoped>
.logistics-detail {
  min-height: 100vh;
  background: var(--color-background);
  padding-bottom: 120rpx;
  font-size: 28rpx;
}

.status-card {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary-dark) 100%);
  padding: 60rpx 30rpx;
  display: flex;
  align-items: flex-start;
  color: #fff;
  position: relative;

  .status-icon {
    font-size: 80rpx;
    margin-right: 30rpx;
    margin-top: 10rpx;
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
      margin-bottom: 20rpx;
      display: block;
    }

    .refresh-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 24rpx;
      opacity: 0.8;

      .refresh-text {
        margin-right: 20rpx;
      }

      .refresh-count {
        font-weight: bold;
      }
    }
  }
}

// 确保所有主要元素使用主题色
.copy-btn,
.map-btn,
.action-btn {
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

.track-item.latest .track-dot {
  background: var(--color-primary) !important;
  box-shadow: 0 0 10rpx rgba(84, 129, 99, 0.5) !important;
}

.track-item.latest .track-desc {
  color: var(--color-primary) !important;
}

.bottom-actions .action-btn.primary {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-secondary-dark) 100%
  ) !important;
  color: #fff !important;
  box-shadow: 0 4rpx 10rpx rgba(84, 129, 99, 0.4) !important;
}

.bottom-actions .action-btn.primary:active {
  box-shadow: 0 2rpx 5rpx rgba(84, 129, 99, 0.3) !important;
}

// 地图卡片样式
.map-card {
  background: var(--color-background);
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--color-primary);

    .action-btn {
      font-size: 24rpx;
      color: var(--color-primary) !important;
    }
  }

  .map-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    background: #f0f0f0;
    border-radius: 12rpx;

    .loading-text {
      font-size: 28rpx;
      color: var(--text-light);
    }
  }
}

// 响应式设计调整
@media (max-width: 375px) {
  .map-card {
    margin: 10rpx;
    padding: 20rpx;
  }

  map {
    height: 300rpx !important;
  }
}

.info-card {
  background: var(--color-background);
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .info-row {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid var(--border-color);

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      font-size: 28rpx;
      color: var(--text-light);
    }

    .value {
      flex: 1;
      font-size: 28rpx;
      color: var(--text-color);
      word-break: break-word;
    }

    .copy-btn {
      font-size: 26rpx;
      color: var(--color-primary);
      padding: 8rpx 20rpx;
      border: 1rpx solid var(--color-primary);
      border-radius: 8rpx;
      margin-left: 20rpx;
    }
  }
}

.track-card {
  background: var(--color-background);
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-actions {
      display: flex;
      gap: 20rpx;

      .action-btn {
        font-size: 24rpx;
        color: var(--color-primary);
      }
    }
  }

  .track-list {
    .track-item {
      position: relative;
      padding-left: 50rpx;
      padding-bottom: 40rpx;
      animation: fadeIn 0.5s ease-in forwards;
      transition: all 0.3s ease;

      &:nth-child(1) {
        animation-delay: 0.1s;
      }
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0.3s;
      }
      &:nth-child(4) {
        animation-delay: 0.4s;
      }
      &:nth-child(5) {
        animation-delay: 0.5s;
      }
      &:nth-child(n + 6) {
        animation-delay: 0.6s;
      }

      &.latest {
        .track-dot {
          background: var(--color-primary);
          width: 20rpx;
          height: 20rpx;
          box-shadow: 0 0 10rpx rgba(84, 129, 99, 0.5);
          animation: pulse 2s infinite;
        }

        .track-desc {
          color: var(--color-primary);
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
        transition: all 0.3s ease;
      }

      .track-line {
        position: absolute;
        left: 7rpx;
        top: 28rpx;
        bottom: 0;
        width: 2rpx;
        background: #ddd;
        transition: all 0.3s ease;
      }

      .track-content {
        .track-desc {
          font-size: 28rpx;
          color: var(--text-color);
          margin-bottom: 8rpx;
          line-height: 1.5;
        }

        .track-info {
          font-size: 24rpx;
          color: var(--text-light);
          margin-bottom: 4rpx;
        }

        .track-time {
          font-size: 24rpx;
          color: var(--text-light);
          margin-bottom: 8rpx;
        }

        .courier-info {
          font-size: 24rpx;
          color: var(--text-color);
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
  background: var(--color-background);
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

  .action-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    outline: none;

    &.primary {
      background: linear-gradient(
        135deg,
        var(--color-primary) 0%,
        var(--color-secondary-dark) 100%
      );
      color: #fff;
      box-shadow: 0 4rpx 10rpx rgba(84, 129, 99, 0.4);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 5rpx rgba(84, 129, 99, 0.3);
      }
    }
  }
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(84, 129, 99, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(84, 129, 99, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(84, 129, 99, 0);
  }
}

// 响应式设计
@media (max-width: 375px) {
  .status-card {
    padding: 40rpx 20rpx;

    .status-icon {
      font-size: 60rpx;
      margin-right: 20rpx;
    }

    .status-info {
      .status-text {
        font-size: 32rpx;
      }

      .latest-desc {
        font-size: 24rpx;
      }
    }
  }

  .info-card,
  .track-card {
    margin: 10rpx;
    padding: 20rpx;
  }

  .track-item {
    padding-left: 40rpx;
    padding-bottom: 30rpx;
  }

  .card-title {
    font-size: 28rpx;
  }
}

// 深色模式适配
@media (prefers-color-scheme: dark) {
  .logistics-detail {
    background: #1a1a1a;
  }

  .info-card,
  .track-card,
  .map-card {
    background: #2d2d2d;
    color: #fff;
  }

  .info-row {
    border-bottom: 1rpx solid #404040;
  }

  .value {
    color: #e0e0e0 !important;
  }

  .track-dot,
  .track-line {
    background: #555;
  }

  .track-desc {
    color: #e0e0e0;
  }
}
</style>
