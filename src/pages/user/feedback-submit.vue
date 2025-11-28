<template>
  <view class="feedback-submit">
    <uni-nav-bar
      title="提交反馈"
      left-text="返回"
      left-arrow
      @click-left="onBack"
    />

    <view class="feedback-submit__content">
      <!-- 反馈类型 -->
      <view class="form-item">
        <text class="form-label">反馈类型</text>
        <view class="form-select">
          <view
            class="select-item"
            v-for="item in feedbackTypes"
            :key="item.value"
            :class="{ active: selectedType === item.value }"
            @click="selectedType = item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <!-- 反馈标题 -->
      <view class="form-item">
        <text class="form-label">反馈标题</text>
        <input
          class="form-input"
          v-model="feedbackForm.title"
          placeholder="请输入反馈标题"
          maxlength="50"
        />
      </view>

      <!-- 反馈内容 -->
      <view class="form-item">
        <text class="form-label">反馈内容</text>
        <textarea
          class="form-textarea"
          v-model="feedbackForm.content"
          placeholder="请详细描述您遇到的问题或建议"
          maxlength="500"
          rows="5"
        />
        <text class="word-count">{{ feedbackForm.content.length }}/500</text>
      </view>

      <!-- 联系方式 -->
      <view class="form-item">
        <text class="form-label">联系方式</text>
        <input
          class="form-input"
          v-model="feedbackForm.contactInfo"
          placeholder="请留下您的联系方式，方便我们与您沟通"
          maxlength="50"
        />
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="form-label">上传图片</text>
        <view class="uploader">
          <view
            class="uploader-item"
            v-for="(image, index) in feedbackForm.images"
            :key="index"
          >
            <image :src="image" mode="aspectFill" class="uploader-image" />
            <view class="uploader-delete" @click="deleteImage(index)">×</view>
          </view>
          <view
            v-if="feedbackForm.images.length < 5"
            class="uploader-add"
            @click="chooseImage"
          >
            <text class="uploader-add-text">+</text>
          </view>
        </view>
        <text class="uploader-tip">最多上传5张图片</text>
      </view>
    </view>

    <view class="feedback-submit__footer">
      <button
        class="submit-btn"
        :disabled="!canSubmit"
        @click="handleSubmitFeedback"
      >
        提交反馈
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { submitFeedback } from "@/api/feedback";
import { computed, ref } from "vue";

// 反馈类型选项
const feedbackTypes = [
  { value: "bug", label: "功能异常" },
  { value: "suggestion", label: "功能建议" },
  { value: "complaint", label: "投诉建议" },
  { value: "other", label: "其他" },
];

// 选中的类型
const selectedType = ref("bug");

// 反馈表单
const feedbackForm = ref({
  title: "",
  content: "",
  contactInfo: "",
  images: [] as string[],
});

// 计算是否可以提交
const canSubmit = computed(() => {
  return (
    selectedType.value &&
    feedbackForm.value.title.trim() &&
    feedbackForm.value.content.trim()
  );
});

// 返回上一页
const onBack = () => {
  uni.navigateBack();
};

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 5 - feedbackForm.value.images.length,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      feedbackForm.value.images = [
        ...feedbackForm.value.images,
        ...res.tempFilePaths,
      ];
    },
  });
};

// 删除图片
const deleteImage = (index: number) => {
  feedbackForm.value.images.splice(index, 1);
};

// 提交反馈
const handleSubmitFeedback = async () => {
  try {
    uni.showLoading({
      title: "提交中...",
    });

    // 转换图片数组为JSON字符串
    const imagesJson = JSON.stringify(feedbackForm.value.images);

    // 调用API提交反馈
    await submitFeedback({
      type: selectedType.value,
      title: feedbackForm.value.title,
      content: feedbackForm.value.content,
      contactInfo: feedbackForm.value.contactInfo,
      images: imagesJson,
    });

    uni.hideLoading();

    uni.showToast({
      title: "提交成功",
      icon: "success",
    });

    // 跳转到反馈列表页面
    setTimeout(() => {
      uni.navigateTo({
        url: "/pages/user/feedback-list",
      });
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: "提交失败，请重试",
      icon: "none",
    });
  }
};
</script>

<style scoped>
.feedback-submit {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.feedback-submit__content {
  padding: 15px;
}

.form-item {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.form-select {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.select-item {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  background-color: #f5f5f5;
}

.select-item.active {
  border-color: #ff6b6b;
  color: #ff6b6b;
  background-color: #fff5f5;
}

.form-input {
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
}

.form-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  min-height: 120px;
  resize: none;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.uploader-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
}

.uploader-image {
  width: 100%;
  height: 100%;
}

.uploader-delete {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.uploader-add {
  width: 80px;
  height: 80px;
  border: 1px dashed #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.uploader-add-text {
  font-size: 32px;
  color: #999;
}

.uploader-tip {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.feedback-submit__footer {
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

.submit-btn:disabled {
  background-color: #ccc;
}
</style>
