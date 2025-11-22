<template>
  <view class="logistics-detail-container">
    <!-- 物流状态进度条 -->
    <view class="logistics-status-section">
      <view class="status-progress">
        <view
          class="progress-item"
          :class="{ completed: isStatusCompleted('shipped') }"
        >
          <view class="progress-icon">📦</view>
          <view class="progress-label">已发货</view>
        </view>
        <view
          class="progress-line"
          :class="{ completed: isStatusCompleted('transit') }"
        ></view>
        <view
          class="progress-item"
          :class="{ completed: isStatusCompleted('transit') }"
        >
          <view class="progress-icon">🚚</view>
          <view class="progress-label">运输中</view>
        </view>
        <view
          class="progress-line"
          :class="{ completed: isStatusCompleted('signed') }"
        ></view>
        <view
          class="progress-item"
          :class="{ completed: isStatusCompleted('signed') }"
        >
          <view class="progress-icon">✓</view>
          <view class="progress-label">已签收</view>
        </view>
      </view>
      <view class="status-text">{{ logisticsInfo.statusDesc }}</view>
    </view>

    <!-- 快递信息 -->
    <view class="logistics-info-section">
      <view class="info-header">
        <text class="courier-name">{{ logisticsInfo.courierCompany }}</text>
        <text class="tracking-no">{{ logisticsInfo.trackingNo }}</text>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="address-section">
      <view class="section-title">收货地址</view>
      <view class="address-content">
        <view class="address-line">
          <text class="label">收货人：</text>
          <text class="value">{{ logisticsInfo.receiverName }}</text>
        </view>
        <view class="address-line">
          <text class="label">联系电话：</text>
          <text class="value">{{ logisticsInfo.receiverPhone }}</text>
        </view>
        <view class="address-line">
          <text class="label">收货地址：</text>
          <text class="value">{{ logisticsInfo.receiverAddress }}</text>
        </view>
      </view>
    </view>

    <!-- 物流轨迹 -->
    <view class="logistics-track-section">
      <view class="section-title">物流轨迹</view>
      <view class="track-timeline">
        <view
          v-for="(track, index) in logisticsInfo.tracks"
          :key="index"
          class="track-item"
          :class="{ latest: track.isLatest }"
        >
          <view class="track-marker" :class="{ latest: track.isLatest }"></view>
          <view class="track-content">
            <view class="track-time">{{ formatTime(track.operateTime) }}</view>
            <view class="track-location"
              >{{ track.operateCity }} {{ track.operateLocation }}</view
            >
            <view class="track-description">{{ track.description }}</view>
            <view v-if="track.courierName" class="track-courier">
              快递员：{{ track.courierName }}
              <text v-if="track.courierPhone"> {{ track.courierPhone }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <button v-if="!isReceived" class="action-btn" @click="confirmReceipt">
        确认收货
      </button>
      <button
        v-if="isReceived && !logisticsInfo.hasEvaluated"
        class="action-btn evaluate-btn"
        @click="showEvaluationModal = true"
      >
        评价物流
      </button>
    </view>

    <!-- 评价弹窗 -->
    <view v-if="showEvaluationModal" class="evaluation-modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">物流评价</text>
          <text class="close-btn" @click="showEvaluationModal = false">×</text>
        </view>

        <!-- 评分 -->
        <view class="rating-section">
          <view class="rating-item">
            <text class="rating-label">物流速度</text>
            <view class="star-rating">
              <text
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= evaluation.speedRating }"
                @click="evaluation.speedRating = i"
                >★</text
              >
            </view>
          </view>

          <view class="rating-item">
            <text class="rating-label">服务态度</text>
            <view class="star-rating">
              <text
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= evaluation.serviceRating }"
                @click="evaluation.serviceRating = i"
                >★</text
              >
            </view>
          </view>

          <view class="rating-item">
            <text class="rating-label">商品完好度</text>
            <view class="star-rating">
              <text
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= evaluation.qualityRating }"
                @click="evaluation.qualityRating = i"
                >★</text
              >
            </view>
          </view>
        </view>

        <!-- 文字评价 -->
        <view class="textarea-section">
          <textarea
            v-model="evaluation.content"
            placeholder="请输入您的评价（可选）"
            class="evaluation-textarea"
            maxlength="200"
          ></textarea>
          <text class="char-count">{{ evaluation.content.length }}/200</text>
        </view>

        <!-- 操作按钮 -->
        <view class="modal-actions">
          <button class="btn-cancel" @click="showEvaluationModal = false">
            取消
          </button>
          <button class="btn-submit" @click="submitEvaluation">提交评价</button>
        </view>
      </view>
    </view>

    <!-- 确认收货弹窗 -->
    <view v-if="showConfirmModal" class="confirm-modal">
      <view class="modal-content">
        <view class="modal-title">确认收货</view>
        <view class="modal-message">确认已收到快递吗？</view>
        <view class="modal-actions">
          <button class="btn-cancel" @click="showConfirmModal = false">
            取消
          </button>
          <button class="btn-confirm" @click="handleConfirmReceipt">
            确认
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import request from "@/utils/request";
import { onMounted, ref } from "vue";

interface LogisticsTrack {
  operateTime: number;
  operateCity: string;
  operateLocation: string;
  description: string;
  courierName?: string;
  courierPhone?: string;
  isLatest: boolean;
}

interface LogisticsInfo {
  id: string;
  orderNo: string;
  courierCompany: string;
  trackingNo: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  status: string;
  statusDesc: string;
  shippedTime?: number;
  signedTime?: number;
  tracks: LogisticsTrack[];
  hasEvaluated: boolean;
}

const logisticsInfo = ref<LogisticsInfo>({
  id: "",
  orderNo: "",
  courierCompany: "顺丰速运",
  trackingNo: "SF123456789",
  receiverName: "张三",
  receiverPhone: "1360****0001",
  receiverAddress: "北京市朝阳区xxx",
  status: "transit",
  statusDesc: "您的快递正在运输中",
  tracks: [],
  hasEvaluated: false,
});

const showEvaluationModal = ref(false);
const showConfirmModal = ref(false);
const isReceived = ref(false);

const evaluation = ref({
  speedRating: 0,
  serviceRating: 0,
  qualityRating: 0,
  content: "",
});

// 获取物流信息
onMounted(() => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  const orderId =
    currentPage?.options?.orderId || currentPage?.route?.query?.orderId || "";
  if (orderId) {
    fetchLogisticsInfo(orderId);
  }
});

// 获取物流信息
const fetchLogisticsInfo = async (orderId: string) => {
  try {
    const res: any = await request.get(`/logistics/order/${orderId}`);
    logisticsInfo.value = res;
  } catch (error) {
    console.error("获取物流信息失败", error);
    uni.showToast({ title: "获取物流信息失败", icon: "error" });
  }
};

// 判断状态是否完成
const isStatusCompleted = (status: string): boolean => {
  const statusOrder = ["shipped", "transit", "signed"];
  const currentIndex = statusOrder.indexOf(logisticsInfo.value.status);
  return currentIndex >= statusOrder.indexOf(status);
};

// 格式化时间
const formatTime = (timestamp: number): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 确认收货
const confirmReceipt = () => {
  showConfirmModal.value = true;
};

// 处理确认收货
const handleConfirmReceipt = async () => {
  try {
    await request.post(`/order/${logisticsInfo.value.id}/confirm-receipt`);
    showConfirmModal.value = false;
    isReceived.value = true;
    uni.showToast({ title: "已确认收货", icon: "success" });
    // 刷新物流信息
    await fetchLogisticsInfo(logisticsInfo.value.id);
  } catch (error) {
    console.error("操作失败", error);
    uni.showToast({ title: "操作失败，请重试", icon: "error" });
  }
};

// 提交评价
const submitEvaluation = async () => {
  if (
    !evaluation.value.speedRating ||
    !evaluation.value.serviceRating ||
    !evaluation.value.qualityRating
  ) {
    uni.showToast({ title: "请完成所有评分", icon: "none" });
    return;
  }

  try {
    await request.post(`/logistics/${logisticsInfo.value.id}/evaluate`, {
      speedRating: evaluation.value.speedRating,
      serviceRating: evaluation.value.serviceRating,
      qualityRating: evaluation.value.qualityRating,
      content: evaluation.value.content,
    });
    showEvaluationModal.value = false;
    uni.showToast({ title: "感谢您的评价", icon: "success" });
    // 刷新物流信息
    await fetchLogisticsInfo(logisticsInfo.value.id);
  } catch (error) {
    console.error("提交失败", error);
    uni.showToast({ title: "提交失败，请重试", icon: "error" });
  }
};
</script>

<style scoped lang="scss">
.logistics-detail-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
}

.logistics-status-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.status-value {
  font-size: 14px;
  color: #548163;
}

.status-time {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.logistics-info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.info-header .courier-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.info-header .tracking-no {
  font-size: 14px;
  color: #666;
}

.info-header .btn-logistics {
  padding: 6px 12px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.info-header .btn-logistics:active {
  background: #456a52;
}

.address-section {
  margin-top: 20px;
}

.address-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.address-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.address-content .address-line {
  margin-bottom: 8px;
}

.address-content .address-line:last-child {
  margin-bottom: 0;
}

.logistics-track-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.track-timeline {
  position: relative;
  padding-left: 24px;
  margin-left: 8px;
}

.track-timeline:before {
  content: "";
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.track-item {
  position: relative;
  margin-bottom: 20px;
}

.track-item:last-child {
  margin-bottom: 0;
}

.track-marker {
  position: absolute;
  left: -24px;
  top: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 2px solid white;
  z-index: 1;
}

.track-marker.latest {
  background: #548163;
  box-shadow: 0 0 0 2px #dbe5de;
}

.track-content {
  background: #f8f9ff;
  border-radius: 8px;
  padding: 12px 16px;
}

.track-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.track-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.action-section {
  padding: 0 16px;
}

.action-btn {
  width: 100%;
  padding: 14px;
  background: white;
  color: #548163;
  border: 1px solid #548163;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}

.action-btn.evaluate-btn {
  background: #548163;
  color: white;
}

.action-btn:active {
  opacity: 0.8;
}

.evaluation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.evaluation-modal .modal-content {
  background: white;
  border-radius: 16px 16px 0 0;
  padding: 20px;
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
}

.evaluation-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.evaluation-modal .modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.evaluation-modal .close-btn {
  font-size: 28px;
  color: #999;
  cursor: pointer;
}

.evaluation-modal .rating-section {
  margin-bottom: 20px;
}

.evaluation-modal .rating-item {
  margin-bottom: 16px;
}

.evaluation-modal .rating-item:last-child {
  margin-bottom: 0;
}

.evaluation-modal .rating-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.evaluation-modal .star-rating {
  display: flex;
  gap: 8px;
}

.evaluation-modal .star-rating .star {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
}

.evaluation-modal .star-rating .star:active {
  transform: scale(1.2);
}

.evaluation-modal .star-rating .star.active {
  color: #ffc107;
}

.evaluation-modal .textarea-section {
  margin-bottom: 20px;
}

.evaluation-modal .evaluation-textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  background: #fafafa;
}

.evaluation-modal .evaluation-textarea:focus {
  outline: none;
  border-color: #548163;
  background: white;
}

.evaluation-modal .evaluation-textarea::placeholder {
  color: #999;
}

.evaluation-modal .modal-actions {
  display: flex;
  gap: 12px;
}

.evaluation-modal .btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.evaluation-modal .btn-cancel:active {
  background: #e0e0e0;
}

.evaluation-modal .btn-submit {
  flex: 1;
  padding: 12px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.evaluation-modal .btn-submit:active {
  background: #456a52;
}

.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-modal .modal-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 80%;
  max-width: 300px;
  text-align: center;
}

.confirm-modal .modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.confirm-modal .modal-message {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.confirm-modal .modal-actions {
  display: flex;
  gap: 12px;
}

.confirm-modal .btn-cancel {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-modal .btn-cancel:active {
  background: #e0e0e0;
}

.confirm-modal .btn-confirm {
  flex: 1;
  padding: 12px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-modal .btn-confirm:active {
  background: #456a52;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
