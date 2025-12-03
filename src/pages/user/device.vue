<template>
  <view class="device-container">
    <view class="device-header">
      <text class="title">设备管理</text>
      <text class="logout-all-btn" @click="logoutAllDevices"
        >一键下线其他设备</text
      >
    </view>

    <view v-if="devices.length === 0" class="empty-devices">
      <text>暂无设备记录</text>
    </view>

    <view v-else class="device-list">
      <view v-for="device in devices" :key="device.id" class="device-item">
        <view class="device-info">
          <view class="device-name">{{ device.deviceName || "未知设备" }}</view>
          <view class="device-type">{{ device.deviceType || "未知类型" }}</view>
          <view class="login-info">
            <text class="login-ip">IP: {{ device.loginIp || "未知IP" }}</text>
            <text class="login-time">{{ formatTime(device.loginTime) }}</text>
          </view>
          <view class="last-active">
            最后活跃: {{ formatTime(device.lastActiveTime) }}
          </view>
        </view>
        <view class="device-status">
          <view
            class="status-badge"
            :class="device.status === 1 ? 'online' : 'offline'"
          >
            {{ device.status === 1 ? "在线" : "已下线" }}
          </view>
          <button
            v-if="device.status === 1"
            class="offline-btn"
            @click="handleOfflineDevice(device.id)"
          >
            下线
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { listDevices, offlineDevice, offlineOtherDevices } from "@/api/device";
import { onMounted, ref } from "vue";

const devices = ref<any[]>([]);

// 获取设备列表
const getDevices = async () => {
  try {
    const res = await listDevices();
    if (res.code === 200) {
      devices.value = res.data;
    }
  } catch (error) {
    console.error("获取设备列表失败:", error);
    uni.showToast({ title: "获取失败", icon: "error" });
  }
};

// 下线指定设备
const handleOfflineDevice = async (deviceId: string) => {
  uni.showModal({
    title: "提示",
    content: "确定要下线该设备吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await offlineDevice(deviceId);
          uni.showToast({ title: "下线成功", icon: "success" });
          getDevices();
        } catch (error) {
          console.error("下线设备失败:", error);
          uni.showToast({ title: "下线失败", icon: "error" });
        }
      }
    },
  });
};

// 一键下线其他设备
const logoutAllDevices = async () => {
  uni.showModal({
    title: "提示",
    content: "确定要下线除当前设备外的所有设备吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          // 这里需要获取当前设备令牌，实际项目中应该从本地存储或全局状态中获取
          const currentDeviceToken = uni.getStorageSync("deviceToken") || "";
          const result = await offlineOtherDevices(currentDeviceToken);
          if (result.code === 200) {
            uni.showToast({
              title: `成功下线${result.data}台设备`,
              icon: "success",
            });
            getDevices();
          }
        } catch (error) {
          console.error("下线其他设备失败:", error);
          uni.showToast({ title: "操作失败", icon: "error" });
        }
      }
    },
  });
};

// 格式化时间
const formatTime = (time: string | Date) => {
  if (!time) return "";
  const date = new Date(time);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

onMounted(() => {
  getDevices();
});
</script>

<style scoped>
.device-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 20px;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.logout-all-btn {
  font-size: 14px;
  color: #ff4444;
}

.empty-devices {
  background-color: #fff;
  padding: 40px 20px;
  text-align: center;
  border-radius: 8px;
  color: #999;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.device-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.device-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.login-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.last-active {
  font-size: 12px;
  color: #999;
}

.device-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.online {
  background-color: #e8f5e8;
  color: #4caf50;
}

.status-badge.offline {
  background-color: #ffebee;
  color: #f44336;
}

.offline-btn {
  background-color: #ff4444;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
