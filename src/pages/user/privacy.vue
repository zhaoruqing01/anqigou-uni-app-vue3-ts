<template>
  <view class="privacy-container">
    <view class="privacy-header">
      <text class="title">隐私设置</text>
    </view>

    <view class="privacy-list">
      <!-- 个性化推荐开关 -->
      <view class="privacy-item">
        <view class="privacy-info">
          <text class="privacy-title">个性化推荐</text>
          <text class="privacy-desc">开启后将根据您的浏览历史推荐相关商品</text>
        </view>
        <switch
          :checked="personalizedRecommendation"
          @change="togglePersonalizedRecommendation"
          color="#2ecaa6"
        ></switch>
      </view>

      <!-- 位置授权开关 -->
      <view class="privacy-item">
        <view class="privacy-info">
          <text class="privacy-title">位置授权</text>
          <text class="privacy-desc">开启后将用于物流地址自动定位</text>
        </view>
        <switch
          :checked="locationAuthorization"
          @change="toggleLocationAuthorization"
          color="#2ecaa6"
        ></switch>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getUserInfo, updateUserInfo } from "@/api/auth";
import { onMounted, ref } from "vue";

const personalizedRecommendation = ref(true);
const locationAuthorization = ref(true);

// 获取用户信息
const getUserData = async () => {
  try {
    const res = await getUserInfo();
    if (res.code === 200) {
      personalizedRecommendation.value =
        res.data.personalizedRecommendation === 1;
      locationAuthorization.value = res.data.locationAuthorization === 1;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 切换个性化推荐开关
const togglePersonalizedRecommendation = async (e: any) => {
  const value = e.detail.value ? 1 : 0;
  try {
    await updateUserInfo({
      personalizedRecommendation: value,
    });
    personalizedRecommendation.value = e.detail.value;
    uni.showToast({ title: "设置成功", icon: "success" });
  } catch (error) {
    console.error("更新个性化推荐设置失败:", error);
    uni.showToast({ title: "设置失败", icon: "error" });
    // 恢复原状态
    personalizedRecommendation.value = !e.detail.value;
  }
};

// 切换位置授权开关
const toggleLocationAuthorization = async (e: any) => {
  const value = e.detail.value ? 1 : 0;
  try {
    await updateUserInfo({
      locationAuthorization: value,
    });
    locationAuthorization.value = e.detail.value;
    uni.showToast({ title: "设置成功", icon: "success" });
  } catch (error) {
    console.error("更新位置授权设置失败:", error);
    uni.showToast({ title: "设置失败", icon: "error" });
    // 恢复原状态
    locationAuthorization.value = !e.detail.value;
  }
};

onMounted(() => {
  getUserData();
});
</script>

<style scoped>
.privacy-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

.privacy-header {
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.privacy-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.privacy-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.privacy-info {
  flex: 1;
}

.privacy-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.privacy-desc {
  font-size: 12px;
  color: #999;
  display: block;
}
</style>
