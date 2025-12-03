<template>
  <view class="feedback-list">
    <uni-nav-bar
      title="我的反馈"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <view class="feedback-list__content">
      <view v-if="feedbackList.length === 0" class="empty">
        <image
          src="@/static/images/cart-empty.png"
          mode="aspectFit"
          class="empty-img"
        />
        <text class="empty-text">暂无反馈记录</text>
      </view>

      <view
        v-else
        class="feedback-item"
        v-for="item in feedbackList"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <view class="feedback-item__header">
          <text class="feedback-item__title">{{ item.title }}</text>
          <view class="feedback-item__status" :class="item.status">
            {{ getStatusText(item.status) }}
          </view>
        </view>

        <view class="feedback-item__content">
          <text class="feedback-item__type">{{ getTypeText(item.type) }}</text>
          <text class="feedback-item__content-text">{{ item.content }}</text>
        </view>

        <view class="feedback-item__footer">
          <text class="feedback-item__time">{{
            formatTime(item.createdAt)
          }}</text>
          <text v-if="item.replyContent" class="feedback-item__reply"
            >查看回复</text
          >
        </view>
      </view>
    </view>

    <view class="feedback-list__footer">
      <button class="submit-btn" @click="goToSubmit">提交新反馈</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getUserFeedbackList } from "@/api/feedback";
import { onMounted, ref } from "vue";
const feedbackList = ref<any[]>([]);
const page = ref(1);
const size = ref(10);
const hasMore = ref(true);

// 返回上一页
const onBack = () => {
  uni.navigateBack();
};

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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

// 跳转到反馈详情
const goToDetail = (feedbackId: string) => {
  uni.navigateTo({
    url: `/pages/user/feedback-detail?feedbackId=${feedbackId}`,
  });
};

// 跳转到提交反馈页面
const goToSubmit = () => {
  uni.navigateTo({
    url: "/pages/user/feedback-submit",
  });
};

// 加载反馈列表
const loadFeedbackList = async () => {
  try {
    const res = await getUserFeedbackList({
      page: page.value,
      size: size.value,
    });
    if (res.data.records) {
      if (page.value === 1) {
        feedbackList.value = res.data.records;
      } else {
        feedbackList.value = [...feedbackList.value, ...res.data.records];
      }
      hasMore.value = res.data.records.length === size.value;
    }
  } catch (error) {
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  }
};

onMounted(() => {
  loadFeedbackList();
});
</script>

<style scoped>
.feedback-list {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.feedback-list__content {
  padding: 10px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-img {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

.feedback-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.feedback-item__title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.feedback-item__status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.feedback-item__status.pending {
  background-color: #fff2cc;
  color: #ff9800;
}

.feedback-item__status.processing {
  background-color: #e3f2fd;
  color: #2196f3;
}

.feedback-item__status.completed {
  background-color: #e8f5e8;
  color: #4caf50;
}

.feedback-item__content {
  margin-bottom: 10px;
}

.feedback-item__type {
  display: inline-block;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.feedback-item__content-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feedback-item__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.feedback-item__reply {
  color: #2196f3;
}

.feedback-list__footer {
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #eee;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background-color: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 16px;
}
</style>
