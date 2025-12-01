<template>
  <view class="setting-page">
    <!-- 头像设置 -->
    <view class="setting-item" @click="changeAvatar">
      <text class="setting-item-icon">👤</text>
      <text class="setting-item-title">头像</text>
      <view class="avatar-preview">
        <image :src="userInfo.avatar || defaultAvatar" class="avatar-image" mode="aspectFill" />
        <text class="arrow">›</text>
      </view>
    </view>

    <!-- 用户名设置 -->
    <view class="setting-item" @click="editNickname">
      <text class="setting-item-icon">📝</text>
      <text class="setting-item-title">用户名</text>
      <text class="setting-item-value">{{ userInfo.nickname || '未设置' }}</text>
      <text class="arrow">›</text>
    </view>

    <!-- 手机号设置 -->
    <view class="setting-item" @click="editPhone">
      <text class="setting-item-icon">📱</text>
      <text class="setting-item-title">手机号</text>
      <text class="setting-item-value">{{ formatPhone(userInfo.phone) }}</text>
      <text class="arrow">›</text>
    </view>

    <!-- 密码设置 -->
    <view class="setting-item" @click="editPassword">
      <text class="setting-item-icon">🔒</text>
      <text class="setting-item-title">密码</text>
      <text class="setting-item-value">修改密码</text>
      <text class="arrow">›</text>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @click="logout">退出登录</view>

    <!-- 头像选择弹窗 -->
    <uni-popup ref="avatarPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">更换头像</text>
          <text class="popup-close" @click="closeAvatarPopup">×</text>
        </view>
        <view class="avatar-options">
          <view class="option" @click="chooseFromAlbum">
            <text class="option-icon">📷</text>
            <text class="option-text">从相册选择</text>
          </view>
          <view class="option" @click="takePhoto">
            <text class="option-icon">📸</text>
            <text class="option-text">拍照</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 用户名修改弹窗 -->
    <uni-popup ref="nicknamePopup" type="center">
      <view class="input-popup">
        <view class="popup-header">
          <text class="popup-title">修改用户名</text>
          <text class="popup-close" @click="closeNicknamePopup">×</text>
        </view>
        <input
          v-model="newNickname"
          class="input-field"
          placeholder="请输入新的用户名"
          maxlength="16"
        />
        <button class="confirm-btn" @click="saveNickname">确定</button>
      </view>
    </uni-popup>

    <!-- 手机号修改弹窗 -->
    <uni-popup ref="phonePopup" type="center">
      <view class="input-popup">
        <view class="popup-header">
          <text class="popup-title">修改手机号</text>
          <text class="popup-close" @click="closePhonePopup">×</text>
        </view>
        <input
          v-model="newPhone"
          class="input-field"
          placeholder="请输入新的手机号"
          type="number"
          maxlength="11"
        />
        <button class="confirm-btn" @click="savePhone">确定</button>
      </view>
    </uni-popup>

    <!-- 密码修改弹窗 -->
    <uni-popup ref="passwordPopup" type="center">
      <view class="input-popup">
        <view class="popup-header">
          <text class="popup-title">修改密码</text>
          <text class="popup-close" @click="closePasswordPopup">×</text>
        </view>
        <input v-model="oldPassword" class="input-field" placeholder="请输入旧密码" password />
        <input v-model="newPassword" class="input-field" placeholder="请输入新密码" password />
        <input
          v-model="confirmPassword"
          class="input-field"
          placeholder="请再次输入新密码"
          password
        />
        <button class="confirm-btn" @click="savePassword">确定</button>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { getUserInfo, updateUserInfo } from '@/api/auth';
import { useUserStore } from '@/stores/user';
import { onMounted, reactive, ref } from 'vue';

const userStore = useUserStore();
const defaultAvatar = 'https://www.eduplus.net/static/png/icon_man.a973c7241763647499790.png';

// 用户信息
const userInfo = reactive({
  avatar: '',
  nickname: '',
  phone: '',
});

// 弹窗引用
const avatarPopup = ref();
const nicknamePopup = ref();
const phonePopup = ref();
const passwordPopup = ref();

// 输入数据
const newNickname = ref('');
const newPhone = ref('');
const verifyCode = ref('');
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// 验证码倒计时
const isSendingCode = ref(false);
const countdown = ref(60);
let countdownTimer: NodeJS.Timeout | null = null;

// 格式化手机号
const formatPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res: any = await getUserInfo();
    if (res.code === 0) {
      Object.assign(userInfo, res.data);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 更换头像
const changeAvatar = () => {
  avatarPopup.value.open();
};

const closeAvatarPopup = () => {
  avatarPopup.value.close();
};

const chooseFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      const resInfo: any = await updateUserInfo({
        avatar: tempFilePath,
      });
      if (resInfo.code === 0) {
        userInfo.avatar = tempFilePath;
        userStore.setUser({
          ...userStore.user!,
          avatar: tempFilePath,
        });
        closeAvatarPopup();
        uni.showToast({
          title: '修改成功了',
          icon: 'success',
        });
        loadUserInfo();
      }
    },
  });
};

const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sourceType: ['camera'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      const resInfo: any = await updateUserInfo({
        avatar: tempFilePath,
      });
      if (resInfo.code === 0) {
        userInfo.avatar = tempFilePath;
        userStore.setUser({
          ...userStore.user!,
          avatar: tempFilePath,
        });
        closeAvatarPopup();
        uni.showToast({
          title: '修改成功了',
          icon: 'success',
        });
        loadUserInfo();
      }
    },
  });

  closeAvatarPopup();
};

// 修改用户名
const editNickname = () => {
  newNickname.value = userInfo.nickname;
  nicknamePopup.value.open();
};

const closeNicknamePopup = () => {
  nicknamePopup.value.close();
};

const saveNickname = async () => {
  if (!newNickname.value.trim()) {
    uni.showToast({
      title: '用户名不能为空',
      icon: 'none',
    });
    return;
  }

  if (newNickname.value.length < 2 || newNickname.value.length > 16) {
    uni.showToast({
      title: '用户名长度为2-16个字符',
      icon: 'none',
    });
    return;
  }

  try {
    const res: any = await updateUserInfo({
      nickname: newNickname.value,
    });

    if (res.code === 0) {
      userInfo.nickname = newNickname.value;
      userStore.setUser({
        ...userStore.user!,
        nickname: newNickname.value,
      });
      closeNicknamePopup();
      uni.showToast({
        title: '修改成功',
        icon: 'success',
      });
      loadUserInfo();
    } else {
      uni.showToast({
        title: res.message || '修改失败',
        icon: 'none',
      });
    }
  } catch (error) {
    uni.showToast({
      title: '网络异常，请稍后再试',
      icon: 'none',
    });
  }
};

// 修改手机号
const editPhone = () => {
  newPhone.value = '';
  verifyCode.value = '';
  phonePopup.value.open();
};

const closePhonePopup = () => {
  phonePopup.value.close();
  // 清除倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  isSendingCode.value = false;
  countdown.value = 60;
};

const savePhone = async () => {
  if (!/^1[3-9]\d{9}$/.test(newPhone.value)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    });
    return;
  }

  const res: any = await updateUserInfo({
    phone: newPhone.value,
  });
  if (res.code === 0) {
    userInfo.phone = newPhone.value;
    userStore.setUser({
      ...userStore.user!,
      phone: newPhone.value,
    });
    closeNicknamePopup();
    uni.showToast({
      title: '修改成功',
      icon: 'success',
    });
    loadUserInfo();
  } else {
    uni.showToast({
      title: res.message || '修改失败',
      icon: 'none',
    });
  }
  uni.showToast({
    title: '手机号修改成功',
    icon: 'success',
  });

  setTimeout(() => {
    closePhonePopup();
    userInfo.phone = newPhone.value;
  }, 1000);
};

// 修改密码
const editPassword = () => {
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  passwordPopup.value.open();
};

const closePasswordPopup = () => {
  passwordPopup.value.close();
};

const savePassword = async () => {
  if (!oldPassword.value) {
    uni.showToast({
      title: '请输入旧密码',
      icon: 'none',
    });
    return;
  }

  if (!newPassword.value) {
    uni.showToast({
      title: '请输入新密码',
      icon: 'none',
    });
    return;
  }

  if (newPassword.value.length < 6) {
    uni.showToast({
      title: '密码至少6位',
      icon: 'none',
    });
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次输入的密码不一致',
      icon: 'none',
    });
    return;
  }

  // 实际项目中这里会调用修改密码的API
  uni.showToast({
    title: '密码修改成功',
    icon: 'success',
  });

  setTimeout(() => {
    closePasswordPopup();
  }, 1000);
};

// 退出登录
const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout();
        uni.redirectTo({
          url: '/pages/auth/login',
        });
      }
    },
  });
};

// 页面加载时获取用户信息
onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.setting-page {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  box-shadow: 0 2px 10rpx rgba(0, 0, 0, 0.05);

  .setting-item-icon {
    font-size: 36rpx;
    margin-right: 20rpx;
    width: 50rpx;
  }

  .setting-item-title {
    font-size: 32rpx;
    flex: 1;
  }

  .setting-item-value {
    font-size: 28rpx;
    color: #999;
    margin-right: 10rpx;
  }

  .arrow {
    font-size: 36rpx;
    color: #ccc;
  }

  .avatar-preview {
    display: flex;
    align-items: center;

    .avatar-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
    }
  }
}

.logout-btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: #fff;
  border-radius: 10rpx;
  margin-top: 40rpx;
  color: #ff4d4f;
  font-size: 32rpx;
  box-shadow: 0 2px 10rpx rgba(0, 0, 0, 0.05);
}

.popup-content {
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;

    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
    }

    .popup-close {
      font-size: 48rpx;
      color: #999;
    }
  }

  .avatar-options {
    padding-top: 30rpx;

    .option {
      display: flex;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;

      .option-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }

      .option-text {
        font-size: 32rpx;
      }
    }

    .option:last-child {
      border-bottom: none;
    }
  }
}

.input-popup {
  width: 80vw;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;

    .popup-title {
      font-size: 36rpx;
      font-weight: bold;
    }

    .popup-close {
      font-size: 48rpx;
      color: #999;
    }
  }

  .input-field {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid #eee;
    border-radius: 10rpx;
    padding: 0 20rpx;
    margin: 20rpx 0;
    font-size: 30rpx;
  }

  .verify-code-section {
    display: flex;
    gap: 20rpx;

    .verify-code-input {
      flex: 1;
    }

    .send-code-btn {
      width: 200rpx;
      height: 80rpx;
      line-height: 80rpx;
      background-color: $primary-color;
      color: #fff;
      border-radius: 10rpx;
      font-size: 28rpx;

      &:disabled {
        background-color: #ccc;
      }
    }
  }

  .confirm-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background-color: $primary-color;
    color: #fff;
    border-radius: 10rpx;
    font-size: 32rpx;
    margin-top: 20rpx;
  }
}
</style>
