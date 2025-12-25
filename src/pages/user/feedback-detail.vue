<template>
  <view class="feedback-detail">
    <uni-nav-bar
      title="反馈详情"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <view class="feedback-detail__content">
      <!-- 反馈基本信息 -->
      <view class="detail-section">
        <view class="detail-item">
          <text class="detail-label">反馈类型</text>
          <text class="detail-value">{{
            getTypeText(feedbackDetail.type)
          }}</text>
        </view>

        <view class="detail-item">
          <text class="detail-label">反馈标题</text>
          <text class="detail-value">{{ feedbackDetail.title }}</text>
        </view>

        <view class="detail-item">
          <text class="detail-label">提交时间</text>
          <text class="detail-value">{{
            formatTime(feedbackDetail.createdAt)
          }}</text>
        </view>

        <view class="detail-item">
          <text class="detail-label">处理状态</text>
          <view class="status-tag" :class="feedbackDetail.status">
            {{ getStatusText(feedbackDetail.status) }}
          </view>
        </view>
      </view>

      <!-- 反馈内容 -->
      <view class="detail-section">
        <text class="section-title">反馈内容</text>
        <text class="content-text">{{ feedbackDetail.content }}</text>

        <!-- 反馈图片 -->
        <view
          v-if="
            feedbackDetail.images &&
            JSON.parse(feedbackDetail.images).length > 0
          "
          class="images-container"
        >
          <image
            v-for="(image, index) in JSON.parse(feedbackDetail.images)"
            :key="index"
            :src="image"
            mode="aspectFill"
            class="feedback-image"
            @click="previewImage(image)"
          />
        </view>
      </view>

      <!-- 联系方式 -->
      <view v-if="feedbackDetail.contactInfo" class="detail-section">
        <text class="section-title">联系方式</text>
        <text class="content-text">{{ feedbackDetail.contactInfo }}</text>
      </view>

      <!-- 回复内容 -->
      <view
        v-if="feedbackDetail.replyContent"
        class="detail-section reply-section"
      >
        <text class="section-title">官方回复</text>
        <view class="reply-content">
          <text class="reply-text">{{ feedbackDetail.replyContent }}</text>
          <text class="reply-time">{{
            formatTime(feedbackDetail.replyTime)
          }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 导入API
import { getFeedbackDetail } from "@/api/feedback";
import { onMounted, ref } from "vue";

// 反馈详情
const feedbackDetail = ref({
  id: "",
  type: "",
  title: "",
  content: "",
  images: "",
  contactInfo: "",
  status: "",
  replyContent: "",
  replyTime: "",
  createdAt: "",
});

// 返回上一页
const onBack = () => {
  // @ts-ignore
  uni.navigateBack();
};

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return "";
  const date = new Date(time);
  const month = (date.getMonth() + 1).toString();
  const day = date.getDate().toString();
  const hours = date.getHours().toString();
  const minutes = date.getMinutes().toString();

  // 手动实现padStart功能
  const padStart = (str: string, length: number, pad: string) => {
    while (str.length < length) {
      str = pad + str;
    }
    return str;
  };

  return `${date.getFullYear()}-${padStart(month, 2, "0")}-${padStart(
    day,
    2,
    "0"
  )} ${padStart(hours, 2, "0")}:${padStart(minutes, 2, "0")}`;
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: any = {
    pending: "待处理",
    processing: "处理中",
    completed: "已完成",
  };
  return statusMap[status] || "未知";
};

// 获取类型文本
const getTypeText = (type: string) => {
  const typeMap: any = {
    bug: "功能异常",
    suggestion: "功能建议",
    complaint: "投诉建议",
    other: "其他",
  };
  return typeMap[type] || "其他";
};

// 预览图片
const previewImage = (currentImage: string) => {
  const images = JSON.parse(feedbackDetail.value.images);
  // @ts-ignore
  uni.previewImage({
    current: currentImage,
    urls: images,
  });
};

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const feedbackId = currentPage.$page?.options?.feedbackId || "";

  if (!feedbackId) {
    uni.showToast({
      title: "参数错误",
      icon: "none",
    });
    return;
  }

  // 加载反馈详情
  getFeedbackDetail(feedbackId)
    .then((res) => {
      feedbackDetail.value = res.data;
    })
    .catch((error) => {
      console.error("加载反馈详情失败:", error);
      uni.showToast({
        title: "加载失败",
        icon: "none",
      });
    });
});
</script>

<style scoped>
.feedback-detail {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.feedback-detail__content {
  padding: 10px;
}

.detail-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  color: #333;
}

.status-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.status-tag.pending {
  background-color: #fff2cc;
  color: #ff9800;
}

.status-tag.processing {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-tag.completed {
  background-color: #e8f5e8;
  color: #4caf50;
}

.section-title {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.content-text {
  display: block;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.images-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.feedback-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
}

.reply-section {
  background-color: #fafafa;
  border-left: 4px solid #2196f3;
}

.reply-content {
  background-color: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  position: relative;
}

.reply-text {
  display: block;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
}

.reply-time {
  display: block;
  font-size: 12px;
  color: #999;
  text-align: right;
}
</style>
