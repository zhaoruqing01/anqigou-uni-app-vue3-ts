<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image
        :src="
          userInfo.avatar || 'https://www.eduplus.net/static/png/icon_man.a973c7241763647499790.png'
        "
        class="avatar"
        mode="aspectFill"
      />
      <view class="user-info">
        <view class="nickname">{{ userInfo.nickname || '用户' }}</view>
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
        <view class="stat-value">¥{{ (userInfo.totalConsumption / 100).toFixed(2) }}</view>
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

      <view class="menu-item" @click="goToFeedback">
        <view class="menu-left">
          <text class="icon">💬</text>
          <text class="label">意见反馈</text>
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
import { useUserStore } from '@/stores/user';
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

const userStore = useUserStore();
const userInfo = ref({
  nickname: '',
  phone: '',
  avatar: '',
  memberLevel: 0,
  totalConsumption: 0,
  availablePoints: 0,
});

onShow(() => {
  const user = JSON.parse(uni.getStorageSync('userData'));
  if (user) {
    userInfo.value = {
      nickname: user.nickname || '用户',
      phone: user.phone || '',
      avatar: user.avatar || '',
      memberLevel: user.memberLevel || 0,
      totalConsumption: user.totalConsumption || 0,
      availablePoints: user.availablePoints || 0,
    };
  }
});

const goToOrders = () => {
  uni.navigateTo({ url: '/pages/order/list' });
};

const goToAddresses = () => {
  uni.navigateTo({ url: '/pages/user/address-list' });
};

const goToWallet = () => {
  uni.showToast({ title: '钱包功能开发中', icon: 'none' });
};

const goToDevices = () => {
  uni.navigateTo({ url: '/pages/user/device' });
};

const goToPrivacy = () => {
  uni.navigateTo({ url: '/pages/user/privacy' });
};

const goToSettings = () => {
  uni.navigateTo({ url: '/pages/user/setting' });
};

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/user/favorite' });
};

const goToFeedback = () => {
  uni.navigateTo({ url: '/pages/user/feedback-list' });
};

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.navigateTo({ url: '/pages/auth/login' });
      }
    },
  });
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.profile-container {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 80px;
}

// 用户信息卡片
.user-card {
  @include flex-align-center;
  background: $gradient-primary;
  padding: $spacing-xxl;
  margin-bottom: $spacing-md;
  gap: $spacing-lg;
  @include fade-in;

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: $radius-round;
    background: $white;
    border: 3px solid rgba($white, 0.3);
    box-shadow: $shadow-md;
    object-fit: cover;
  }

  .user-info {
    flex: 1;

    .nickname {
      font-size: $font-xl;
      font-weight: $font-bold;
      color: $white;
      margin-bottom: $spacing-xs;
    }

    .phone {
      font-size: $font-sm;
      color: rgba($white, 0.9);
      margin-bottom: $spacing-md;
    }

    .level {
      @include tag(rgba($white, 0.2), $white);
      font-size: $font-xs;
      border: 1px solid rgba($white, 0.3);
    }
  }
}

// 账户统计
.stats-section {
  @include flex-center;
  background: $white;
  padding: $spacing-xxl;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  gap: $spacing-xxxl;

  .stat-item {
    @include flex-center;
    flex-direction: column;
    gap: $spacing-xs;

    .stat-value {
      font-size: $font-xl;
      font-weight: $font-bold;
      color: $primary-color;
    }

    .stat-label {
      font-size: $font-sm;
      color: $text-secondary;
    }
  }
}

// 功能菜单
.menu-section {
  background: $white;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.menu-item {
  @include flex-between;
  padding: $spacing-lg $spacing-xl;
  border-bottom: 1px solid $border-light;
  cursor: pointer;
  transition: all $transition-base;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: $bg-hover;
  }

  .menu-left {
    @include flex-align-center;
    gap: $spacing-md;

    .icon {
      font-size: 24px;
      line-height: 1;
    }

    .label {
      font-size: $font-md;
      color: $text-primary;
      font-weight: $font-medium;
    }
  }

  .arrow {
    font-size: 20px;
    color: $text-tertiary;
  }
}

// 退出登录
.logout-section {
  padding: 0 $spacing-md;

  .btn-logout {
    width: 100%;
    padding: $spacing-lg;
    background: $white;
    color: $error-color;
    border: none;
    border-radius: $radius-md;
    font-size: $font-md;
    font-weight: $font-semibold;
    box-shadow: $shadow-sm;
    cursor: pointer;
    transition: all $transition-base;

    &:active {
      background: $bg-hover;
      transform: scale(0.98);
    }
  }
}
</style>
