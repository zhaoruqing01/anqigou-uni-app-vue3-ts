<template>
  <view class="container">
    <view class="login-box">
      <!-- 登录方式切换 -->
      <view class="tabs">
        <view
          :class="['tab', { active: loginType === 'password' }]"
          @click="loginType = 'password'"
        >
          密码登录
        </view>
        <view :class="['tab', { active: loginType === 'code' }]" @click="loginType = 'code'">
          验证码登录
        </view>
      </view>

      <!-- 密码登录 -->
      <view v-if="loginType === 'password'">
        <input v-model="password.phone" placeholder="手机号" type="text" class="input" />
        <input v-model="password.password" placeholder="密码" type="password" class="input" />
        <button class="btn-login" @click="passwordLogin">登录</button>
      </view>

      <!-- 验证码登录 -->
      <view v-if="loginType === 'code'">
        <input v-model="code.phone" placeholder="手机号" type="text" class="input" />
        <view class="code-input">
          <input v-model="code.verifyCode" placeholder="验证码" type="text" />
          <button :disabled="countdownTime > 0" @click="sendCode">
            {{ countdownTime > 0 ? `${countdownTime}s` : '获取验证码' }}
          </button>
        </view>
        <button class="btn-login" @click="codeLogin">登录</button>
      </view>

      <!-- 微信登录 -->
      <view class="wechat-login">
        <button class="wechat-btn" @click="handleWechatLogin">微信登录</button>
      </view>

      <!-- 注册链接 -->
      <view class="register-link">
        没有账号？
        <text @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { login, loginWithVerifyCode, sendVerifyCode, wechatLogin } from '@/api/auth';
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';

const userStore = useUserStore();
const loginType = ref('password');
const countdownTime = ref(0);

const password = ref({
  phone: '',
  password: '',
});

const code = ref({
  phone: '',
  verifyCode: '',
});

// 密码登录
const passwordLogin = async () => {
  try {
    const res = await login({
      phone: password.value.phone,
      password: password.value.password,
    });
    userStore.setToken(res.data.token);
    userStore.setUser({
      userId: res.data.userId,
      phone: password.value.phone,
      nickname: res.data.nickname,
      avatar: res.data.avatar,
      memberLevel: 0,
      totalConsumption: 0,
      availablePoints: 0,
    });
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 500);
  } catch (e) {
    console.error('Login failed', e);
  }
};

// 验证码登录
const codeLogin = async () => {
  try {
    const res = await loginWithVerifyCode({
      phone: code.value.phone,
      verifyCode: code.value.verifyCode,
    });
    userStore.setToken(res.data.token);
    userStore.setUser({
      userId: res.data.userId,
      phone: code.value.phone,
      nickname: res.data.nickname,
      avatar: res.data.avatar,
      memberLevel: 0,
      totalConsumption: 0,
      availablePoints: 0,
    });
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      // 跳转tabbar
      uni.switchTab({ url: '/pages/index/index' });
    }, 500);
  } catch (e) {
    console.error('Code login failed', e);
  }
};

// 发送验证码
const sendCode = async () => {
  try {
    await sendVerifyCode(code.value.phone);
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    countdownTime.value = 60;
    const timer = setInterval(() => {
      countdownTime.value--;
      if (countdownTime.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e) {
    console.error('Failed to send code', e);
  }
};

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' });
};

// 微信登录
const handleWechatLogin = async () => {
  try {
    // 调用微信登录API获取code
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    const { code } = loginRes;
    if (!code) {
      throw new Error('Failed to get wechat code');
    }

    // 调用后端微信登录接口
    const res = await wechatLogin(code);
    console.log(res);

    // 保存token和用户信息
    userStore.setToken(res.data.token);
    userStore.setUser({
      userId: res.data.userId,
      phone: res.data.phone || '',
      nickname: res.data.nickname || '',
      avatar: res.data.avatar || '',
      memberLevel: res.data.memberLevel || 0,
      totalConsumption: res.data.totalConsumption || 0,
      availablePoints: res.data.availablePoints || 0,
    });

    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 500);
  } catch (e) {
    console.error('微信登录失败', e);
    uni.showToast({ title: '微信登录失败', icon: 'none' });
  }
};
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/mixins.scss';

.container {
  min-height: 100vh;
  background: $gradient-primary;
  padding: $spacing-xxl;
  @include flex-center;
  flex-direction: column;
}

// Logo区域
.logo-section {
  text-align: center;
  margin: 60px 0 40px;
  @include fade-in;

  .logo {
    @include flex-center;
    width: 90px;
    height: 90px;
    margin: 0 auto $spacing-lg;
    background: $white;
    border-radius: $radius-round;
    font-size: 40px;
    color: $primary-color;
    box-shadow: $shadow-lg;
  }

  .app-name {
    font-size: $font-xxl;
    font-weight: $font-bold;
    color: $white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

// 登录表单
.login-box {
  width: 100%;
  max-width: 400px;
  background: $white;
  border-radius: $radius-lg;
  padding: $spacing-xxl;
  box-shadow: $shadow-lg;
  @include slide-up;
}

// 切换标签
.tabs {
  @include flex-center;
  gap: $spacing-xxl;
  margin-bottom: $spacing-xxl;
  border-bottom: 2px solid $border-light;
}

.tab {
  flex: 1;
  text-align: center;
  padding: $spacing-md 0;
  font-size: $font-md;
  color: $text-tertiary;
  font-weight: $font-medium;
  cursor: pointer;
  position: relative;
  transition: all $transition-base;

  &.active {
    color: $primary-color;
    font-weight: $font-semibold;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background: $gradient-primary;
      border-radius: 2px;
    }
  }

  &:active {
    opacity: 0.7;
  }
}

// 输入框
.input {
  @include input;
  margin-bottom: $spacing-md;
}

// 验证码输入
.code-input {
  @include flex-align-center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;

  input {
    @include input;
    flex: 1;
    margin-bottom: 0;
  }

  button {
    @include btn-secondary;
    padding: $spacing-md $spacing-lg;
    white-space: nowrap;
    min-width: 100px;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// 登录按钮
.btn-login {
  @include btn-primary;
  width: 100%;
  margin-top: $spacing-md;
}

// 微信登录
.wechat-login {
  margin: $spacing-xl 0;

  .wechat-btn {
    @include flex-center;
    width: 100%;
    padding: $spacing-md $spacing-lg;
    background: #07c160;
    color: $white;
    border: none;
    border-radius: $btn-radius;
    font-size: $font-md;
    font-weight: $font-semibold;
    gap: $spacing-sm;
    cursor: pointer;
    transition: all $transition-base;

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

// 注册链接
.register-link {
  text-align: center;
  margin-top: $spacing-lg;
  font-size: $font-sm;
  color: $text-secondary;

  text {
    color: $primary-color;
    font-weight: $font-medium;
    cursor: pointer;
    transition: all $transition-base;

    &:active {
      opacity: 0.7;
    }
  }
}
</style>
