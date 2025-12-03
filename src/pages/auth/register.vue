<template>
  <view class="container">
    <view class="register-box">
      <view class="title">创建账号</view>
      <view class="subtitle">欢迎加入安琦购</view>

      <!-- 手机号输入 -->
      <view class="input-group">
        <text class="label">手机号</text>
        <input
          v-model="form.phone"
          placeholder="请输入11位手机号"
          type="number"
          maxlength="11"
          class="input"
        />
      </view>

      <!-- 密码输入 -->
      <view class="input-group">
        <text class="label">密码</text>
        <input
          v-model="form.password"
          placeholder="请设置密码（6位以上）"
          type="password"
          class="input"
        />
      </view>

      <!-- 确认密码 -->
      <view class="input-group">
        <text class="label">确认密码</text>
        <input
          v-model="form.confirmPassword"
          placeholder="请再次输入密码"
          type="password"
          class="input"
        />
      </view>

      <!-- 昵称输入（可选） -->
      <view class="input-group">
        <text class="label">昵称（可选）</text>
        <input
          v-model="form.nickname"
          placeholder="请输入昵称"
          type="text"
          class="input"
        />
      </view>

      <!-- 注册按钮 -->
      <button
        class="btn-register"
        @click="handleRegister"
        :disabled="isLoading"
      >
        {{ isLoading ? "注册中..." : "创建账号" }}
      </button>

      <!-- 登录链接 -->
      <view class="footer-link">
        <text>已有账号？</text>
        <text class="link-text" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { register } from "@/api/auth";
import { ref } from "vue";

const form = ref({
  phone: "",
  password: "",
  confirmPassword: "",
  nickname: "",
});

const isLoading = ref(false);

// 验证手机号
const validatePhone = (phone: string): boolean => {
  if (!phone) {
    uni.showToast({ title: "请输入手机号", icon: "none" });
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    uni.showToast({ title: "请输入11位手机号", icon: "none" });
    return false;
  }
  return true;
};

// 验证密码
const validatePassword = (password: string): boolean => {
  if (!password) {
    uni.showToast({ title: "请输入密码", icon: "none" });
    return false;
  }
  if (password.length < 6) {
    uni.showToast({ title: "密码长度至少6位", icon: "none" });
    return false;
  }
  return true;
};

// 注册
const handleRegister = async () => {
  // 验证输入
  if (!validatePhone(form.value.phone)) return;
  if (!validatePassword(form.value.password)) return;

  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: "两次密码输入不一致", icon: "none" });
    return;
  }

  isLoading.value = true;
  try {
    const response = await register({
      phone: form.value.phone,
      password: form.value.password,
      nickname: form.value.nickname || undefined,
    });

    uni.showToast({ title: "注册成功", icon: "success" });
    setTimeout(() => {
      uni.navigateTo({ url: "/pages/auth/login" });
    }, 500);
  } catch (error: any) {
    console.error("Register failed", error);
    const errorMsg =
      error?.response?.data?.message || error?.message || "注册失败";
    uni.showToast({ title: errorMsg, icon: "none" });
  } finally {
    isLoading.value = false;
  }
};

// 跳转到登录页
const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style scoped lang="scss">
.container {
  // min-height: 100vh;
  background: linear-gradient(135deg, #548163 0%, #dbe5de 100%);
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.register-box {
  background: white;
  border-radius: 20px;
  padding: 40px 28px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 400px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #999;
  text-align: center;
  margin-bottom: 28px;
}

.input-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  // padding: 12px 14px;
  height: 35px;
  padding: 0 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  background: #f9f9f9;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: #548163;
  background: white;
  box-shadow: 0 0 0 3px rgba(84, 129, 99, 0.1);
}

.input::placeholder {
  color: #ccc;
}

.btn-register {
  width: 100%;
  // padding: 14px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.3s ease;
}

.btn-register:active:not(:disabled) {
  background: #456a52;
  transform: scale(0.98);
}

.btn-register:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.footer-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.link-text {
  color: #548163;
  cursor: pointer;
  font-weight: 600;
  margin-left: 4px;
}

.link-text:active {
  opacity: 0.8;
}
</style>
