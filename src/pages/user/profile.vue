<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image
        :src="
          userInfo.avatar ||
          'https://www.eduplus.net/static/png/icon_man.a973c7241763647499790.png'
        "
        class="avatar"
        mode="aspectFill"
      />
      <view class="user-info">
        <view class="nickname">{{ userInfo.nickname || "用户" }}</view>
        <view class="phone">{{ userInfo.phone }}</view>
        <view class="level">会员等级：LV{{ userInfo.memberLevel }}</view>
      </view>
    </view>

    <!-- 账户统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <view class="stat-value">{{ userInfo.availablePoints }}</view>
        <view class="stat-label">积分</view>
      </view>
      <view class="stat-item">
        <view class="stat-value"
          >¥{{ (userInfo.totalConsumption / 100).toFixed(2) }}</view
        >
        <view class="stat-label">总消费</view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToOrders">
        <view class="menu-left">
          <text class="icon">📦</text>
          <text class="label">我的订单</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @click="goToAddresses">
        <view class="menu-left">
          <text class="icon">📍</text>
          <text class="label">收货地址</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @click="goToWallet">
        <view class="menu-left">
          <text class="icon">💰</text>
          <text class="label">钱包</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @click="goToFavorites">
        <view class="menu-left">
          <text class="icon">❤️</text>
          <text class="label">我的收藏</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @click="goToDevices">
        <view class="menu-left">
          <text class="icon">📱</text>
          <text class="label">设备管理</text>
        </view>
        <text class="arrow">›</text>
      </view>

      <view class="menu-item" @click="goToSettings">
        <view class="menu-left">
          <text class="icon">⚙️</text>
          <text class="label">设置</text>
        </view>
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="btn-logout" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { onMounted, ref } from "vue";

const userStore = useUserStore();
const userInfo = ref({
  nickname: "",
  phone: "",
  avatar: "",
  memberLevel: 0,
  totalConsumption: 0,
  availablePoints: 0,
});

onMounted(() => {
  const user = JSON.parse(uni.getStorageSync("userData"));
  if (user) {
    userInfo.value = {
      nickname: user.nickname || "用户",
      phone: user.phone || "",
      avatar: user.avatar || "",
      memberLevel: user.memberLevel || 0,
      totalConsumption: user.totalConsumption || 0,
      availablePoints: user.availablePoints || 0,
    };
  }
});

const goToOrders = () => {
  uni.navigateTo({ url: "/pages/order/list" });
};

const goToAddresses = () => {
  uni.navigateTo({ url: "/pages/user/address-list" });
};

const goToWallet = () => {
  uni.showToast({ title: "钱包功能开发中", icon: "none" });
};

const goToDevices = () => {
  uni.navigateTo({ url: "/pages/user/device" });
};

const goToPrivacy = () => {
  uni.navigateTo({ url: "/pages/user/privacy" });
};

const goToSettings = () => {
  uni.showToast({ title: "设置功能开发中", icon: "none" });
};

const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.navigateTo({ url: "/pages/auth/login" });
      }
    },
  });
};
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #548163, #dbe5de);
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: start;
}

.user-card .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 40px;
  background: #f0f0f0;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-card .user-info .nickname {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.user-card .user-info .phone {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.user-card .user-info .level {
  display: inline-block;
  padding: 4px 12px;
  background: #548163;
  color: white;
  border-radius: 12px;
  font-size: 12px;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.stats-section .stat-item {
  text-align: center;
}

.stats-section .stat-item .stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #548163;
  margin-bottom: 4px;
}

.stats-section .stat-item .stat-label {
  font-size: 12px;
  color: #666;
}

.menu-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: #f5f5f5;
}

.menu-item .menu-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.menu-item .icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
  background: #f0f0f0;
  border-radius: 6px;
}

.menu-item .label {
  font-size: 16px;
  color: #333;
}

.menu-item .arrow {
  font-size: 20px;
  color: #999;
}

.logout-section {
  padding: 0 20px;
}

.btn-logout {
  width: 100%;
  padding: 16px;
  background: white;
  color: #e74c3c;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-logout:active {
  background: #f5f5f5;
}
</style>
