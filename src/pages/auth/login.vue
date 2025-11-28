<template>
  <view class="container">
    <view class="login-box">
      <!-- 登录方式切换 -->
      <view class="tabs">
        <view
          :class="['tab', { active: loginType === 'password' }]"
          @click="loginType = 'password'"
          >密码登录</view
        >
        <view
          :class="['tab', { active: loginType === 'code' }]"
          @click="loginType = 'code'"
          >验证码登录</view
        >
      </view>

      <!-- 密码登录 -->
      <view v-if="loginType === 'password'">
        <input
          v-model="password.phone"
          placeholder="手机号"
          type="text"
          class="input"
        />
        <input
          v-model="password.password"
          placeholder="密码"
          type="password"
          class="input"
        />
        <button class="btn-login" @click="passwordLogin">登录</button>
      </view>

      <!-- 验证码登录 -->
      <view v-if="loginType === 'code'">
        <input
          v-model="code.phone"
          placeholder="手机号"
          type="text"
          class="input"
        />
        <view class="code-input">
          <input v-model="code.verifyCode" placeholder="验证码" type="text" />
          <button :disabled="countdownTime > 0" @click="sendCode">
            {{ countdownTime > 0 ? `${countdownTime}s` : "获取验证码" }}
          </button>
        </view>
        <button class="btn-login" @click="codeLogin">登录</button>
      </view>

      <!-- 微信登录 -->
      <view class="wechat-login">
        <button class="wechat-btn" @click="wechatLogin">微信登录</button>
      </view>

      <!-- 注册链接 -->
      <view class="register-link">
        没有账号？<text @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { login, loginWithVerifyCode, sendVerifyCode } from "@/api/auth";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const userStore = useUserStore();
const loginType = ref("password");
const countdownTime = ref(0);

const password = ref({
  phone: "",
  password: "",
});

const code = ref({
  phone: "",
  verifyCode: "",
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
    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => {
      uni.switchTab({ url: "/pages/index/index" });
    }, 500);
  } catch (e) {
    console.error("Login failed", e);
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
    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => {
      // 跳转tabbar
      uni.switchTab({ url: "/pages/index/index" });
    }, 500);
  } catch (e) {
    console.error("Code login failed", e);
  }
};

// 发送验证码
const sendCode = async () => {
  try {
    await sendVerifyCode(code.value.phone);
    uni.showToast({ title: "验证码已发送", icon: "success" });
    countdownTime.value = 60;
    const timer = setInterval(() => {
      countdownTime.value--;
      if (countdownTime.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  } catch (e) {
    console.error("Failed to send code", e);
  }
};

// 跳转到注册页
const goToRegister = () => {
  uni.navigateTo({ url: "/pages/auth/register" });
};

// 微信登录
const wechatLogin = () => {
  uni.showToast({ title: "微信授权登录功能开发中", icon: "none" });
  // 实际开发中，这里应该调用微信登录API
  // uni.login({
  //   provider: 'weixin',
  //   success: (res) => {
  //     // 发送code到后端获取token
  //     const code = res.code;
  //     // 调用后端API进行微信登录
  //   }
  // });
};
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #548163, #dbe5de);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.logo-section {
  text-align: center;
  margin: 40px 0;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #548163;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.app-name {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

.login-form {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  font-size: 16px;
  color: #f9f9ff;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tab:active {
  background: #f5f5f5;
}

.tab.active {
  color: #45a465;
  font-weight: 600;
  border-bottom: 2px solid #548163;
}

.tab.active:after {
  content: "";
  display: block;
  width: 30px;
  height: 3px;
  background: #548163;
  margin: 8px auto 0;
  border-radius: 2px;
}

.input-group {
  margin-bottom: 20px;
}

.input {
  width: 90%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: #fafafa;
  margin-bottom: 12px;
}

.input:focus {
  outline: none;
  border-color: #548163;
  background: white;
}

.input::placeholder {
  color: #999;
}

.code-input {
  display: flex;
  gap: 12px;
}

.code-input input {
  flex: 1;
}

.code-input button {
  // padding: 14px 20px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.code-input button:active {
  background: #456a52;
}

.code-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-login {
  width: 100%;
  // padding: 16px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
}

.btn-login:active {
  background: #456a52;
}

.register-link {
  text-align: center;
  margin-top: 20px;
}

.register-link text {
  font-size: 14px;
  color: #666;
}

.register-link text:active {
  color: #548163;
}

/* 微信登录样式 */
.wechat-login {
  margin: 20px 0;
}

.wechat-btn {
  width: 100%;
  padding: 14px 16px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.wechat-btn:active {
  background: #05a051;
}
</style>
