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

      <!-- 微信登录（修正核心：open-type + 直接回调，无嵌套调用） -->
      <view class="wechat-login">
        <button
          class="wechat-btn"
          open-type="getUserInfo"
          @getuserinfo="handleWechatLogin"
          lang="zh_CN"
        >
          微信登录
        </button>
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
// 防止重复登录跳转
const isLoginIng = ref(false);

const password = ref({
  phone: '',
  password: '',
});

const code = ref({
  phone: '',
  verifyCode: '',
});

// 手机号校验正则
const validatePhone = (phone: string) => {
  const reg = /^1[3-9]\d{9}$/;
  return reg.test(phone);
};

// 密码登录
const passwordLogin = async () => {
  // 防重复提交
  if (isLoginIng.value) return;
  // 表单校验
  const { phone, password: pwd } = password.value;
  if (!phone) return uni.showToast({ title: '请输入手机号', icon: 'none' });
  if (!validatePhone(phone)) return uni.showToast({ title: '手机号格式错误', icon: 'none' });
  if (!pwd) return uni.showToast({ title: '请输入密码', icon: 'none' });

  try {
    isLoginIng.value = true;
    const res = await login({ phone, password: pwd });
    if (res?.data?.token) {
      // 存储登录态
      userStore.setToken(res.data.token);
      userStore.setUser({
        userId: res.data.userId,
        phone,
        nickname: res.data.nickname || '',
        avatar: res.data.avatar || '',
        memberLevel: res.data.memberLevel || 0,
        totalConsumption: res.data.totalConsumption || 0,
        availablePoints: res.data.availablePoints || 0,
      });
      uni.showToast({ title: '登录成功', icon: 'success' });
      // 延迟跳转，保证toast可见
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' });
      }, 500);
    }
  } catch (e) {
    console.error('密码登录失败', e);
    uni.showToast({ title: '登录失败，请检查账号密码', icon: 'none' });
  } finally {
    isLoginIng.value = false;
  }
};

// 验证码登录
const codeLogin = async () => {
  if (isLoginIng.value) return;
  const { phone, verifyCode } = code.value;
  // 表单校验
  if (!phone) return uni.showToast({ title: '请输入手机号', icon: 'none' });
  if (!validatePhone(phone)) return uni.showToast({ title: '手机号格式错误', icon: 'none' });
  if (!verifyCode) return uni.showToast({ title: '请输入验证码', icon: 'none' });
  if (verifyCode.length < 6) return uni.showToast({ title: '验证码格式错误', icon: 'none' });

  try {
    isLoginIng.value = true;
    const res = await loginWithVerifyCode({ phone, verifyCode });
    if (res?.data?.token) {
      userStore.setToken(res.data.token);
      userStore.setUser({
        userId: res.data.userId,
        phone,
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
    }
  } catch (e) {
    console.error('验证码登录失败', e);
    uni.showToast({ title: '登录失败，请检查验证码', icon: 'none' });
  } finally {
    isLoginIng.value = false;
  }
};

// 发送验证码
const sendCode = async () => {
  const { phone } = code.value;
  if (!phone) return uni.showToast({ title: '请输入手机号', icon: 'none' });
  if (!validatePhone(phone)) return uni.showToast({ title: '手机号格式错误', icon: 'none' });
  // 防止重复发送
  if (countdownTime.value > 0) return;

  try {
    await sendVerifyCode(phone);
    uni.showToast({ title: '验证码已发送', icon: 'success' });
    // 倒计时逻辑（防抖）
    countdownTime.value = 60;
    const timer = setInterval(() => {
      countdownTime.value--;
      if (countdownTime.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e) {
    console.error('发送验证码失败', e);
    uni.showToast({ title: '验证码发送失败，请重试', icon: 'none' });
  }
};

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({ url: '/pages/auth/register' });
};

// 微信登录（核心修正：直接使用回调的userInfo，无嵌套getUserProfile）
const handleWechatLogin = async (e: any) => {
  // 1. 判断用户是否拒绝授权
  if (!e?.detail?.userInfo) {
    uni.showToast({ title: '您拒绝了授权，无法完成微信登录', icon: 'none' });
    return;
  }
  if (isLoginIng.value) return;

  try {
    isLoginIng.value = true;
    // 2. 获取微信登录code（小程序默认provider为微信，无需显式指定）
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        success: resolve,
        fail: reject,
      });
    });

    if (!loginRes.code) {
      throw new Error('获取微信登录凭证失败');
    }

    // 3. 提取用户信息
    const { userInfo } = e.detail;

    // 4. 调用后端微信登录接口
    const res = await wechatLogin(loginRes.code, userInfo);

    // 5. 存储登录态
    if (res?.data?.token) {
      userStore.setToken(res.data.token);
      userStore.setUser({
        userId: res.data.userId,
        phone: res.data.phone || '',
        nickname: res.data.nickname || userInfo.nickName || '',
        avatar: res.data.avatar || userInfo.avatarUrl || '',
        memberLevel: res.data.memberLevel || 0,
        totalConsumption: res.data.totalConsumption || 0,
        availablePoints: res.data.availablePoints || 0,
      });

      uni.showToast({ title: '微信登录成功', icon: 'success' });
      setTimeout(() => {
        uni.switchTab({ url: '/pages/index/index' });
      }, 500);
    }
  } catch (e: any) {
    console.error('微信登录失败', e);
    // 区分用户主动取消和系统错误
    if (e.errMsg && e.errMsg.includes('cancel')) {
      return;
    }
    uni.showToast({ title: '微信登录失败，请重试', icon: 'none' });
  } finally {
    isLoginIng.value = false;
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

// Logo区域（保留原有样式，若需显示可自行添加logo标签）
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
  width: 100%; // 补充宽度，防止输入框自适应异常
  box-sizing: border-box; // 盒模型修正
}

// 验证码输入
.code-input {
  @include flex-align-center;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  width: 100%;
  box-sizing: border-box;

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
  box-sizing: border-box;
}

// 微信登录
.wechat-login {
  margin: $spacing-xl 0;
  width: 100%;
  box-sizing: border-box;

  .wechat-btn {
    @include flex-center;
    width: 100%;
    padding: $spacing-md $spacing-lg;
    background: #ef2121;
    color: $white;
    border: none;
    border-radius: $btn-radius;
    font-size: $font-md;
    font-weight: $font-semibold;
    gap: $spacing-sm;
    cursor: pointer;
    transition: all $transition-base;
    box-sizing: border-box;

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
