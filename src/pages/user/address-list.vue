<template>
  <view class="address-list">
    <scroll-view class="address-scroll" scroll-y>
      <view
        v-for="address in addressList"
        :key="address.id"
        class="address-card"
        @click="selectAddress(address)"
      >
        <view class="address-content">
          <view class="address-header">
            <view class="receiver-info">
              <text class="receiver-name">{{ address.receiverName }}</text>
              <text class="receiver-phone">{{ address.receiverPhone }}</text>
            </view>
            <view v-if="address.isDefault" class="default-tag">默认</view>
          </view>
          <view class="address-detail">{{ address.fullAddress }}</view>
        </view>
        <view class="address-actions">
          <button class="btn-edit" @click.stop="editAddress(address)">编辑</button>
          <button class="btn-delete" @click.stop="deleteAddress(address.id)">删除</button>
        </view>
      </view>

      <view v-if="addressList.length === 0" class="empty">
        <text>暂无收货地址</text>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <button class="btn-add" @click="addAddress">新增收货地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import request from '@/utils/request';
import { onShow } from '@dcloudio/uni-app';
import { ref } from 'vue';

interface Address {
  id: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  fullAddress: string;
  isDefault: boolean;
}

const addressList = ref<Address[]>([]);

onShow(() => {
  loadAddressList();
});

const loadAddressList = async () => {
  try {
    const response = await request.get('/api/user/address/list');
    if (response.code === 0) {
      addressList.value = response.data || [];
    }
  } catch (error) {
    console.error('加载地址列表失败', error);
    uni.showToast({ title: '加载地址失败', icon: 'error' });
  }
};

const selectAddress = (address: Address) => {
  // 如果是从订单页面跳转过来，选择地址后返回
  const pages = getCurrentPages();
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2] as any;
    if (prevPage.route && prevPage.route.includes('checkout')) {
      // 设置上一页（订单页面）的数据并返回
      if (!prevPage.pageData) prevPage.pageData = {};
      prevPage.pageData.selectedAddress = address;
      uni.navigateBack();
      return;
    }
  }
  // 否则只是查看地址详情
  uni.navigateTo({ url: `/pages/user/address-edit?id=${address.id}` });
};

const addAddress = () => {
  uni.navigateTo({ url: '/pages/user/address-edit' });
};

const editAddress = (address: Address) => {
  uni.navigateTo({ url: `/pages/user/address-edit?id=${address.id}` });
};

const deleteAddress = async (id: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await request.delete(`/api/user/address/${id}`);
          if (response.code === 0) {
            addressList.value = addressList.value.filter((a) => a.id !== id);
            uni.showToast({ title: '删除成功', icon: 'success' });
          }
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'error' });
        }
      }
    },
  });
};
</script>

<style scoped lang="scss">
/* 全局样式重置 */
* {
  box-sizing: border-box;
}

/* 主容器 */
.address-list {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 16px 80px;
}

/* 滚动区域 */
.address-scroll {
  min-height: calc(100vh - 120px);
}

/* 地址卡片 */
.address-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 地址卡片悬停效果 */
.address-card:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 地址卡片内容 */
.address-content {
  margin-bottom: 16px;
}

/* 地址头部 */
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

/* 收货人信息 */
.receiver-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 收货人姓名 */
.receiver-name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

/* 收货人电话 */
.receiver-phone {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* 默认标签 */
.default-tag {
  background: linear-gradient(135deg, #548163 0%, #456a52 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(84, 129, 99, 0.3);
}

/* 地址详情 */
.address-detail {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  padding-left: 4px;
}

/* 地址操作按钮区域 */
.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

/* 操作按钮基础样式 */
.address-actions button {
  padding: 10px 20px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

/* 编辑按钮样式 */
.address-actions .btn-edit {
  color: #548163;
  border-color: #548163;
}

.address-actions .btn-edit:active {
  background: #f0f5f2;
  transform: translateY(1px);
}

/* 删除按钮样式 */
.address-actions .btn-delete {
  color: #e74c3c;
  border-color: #e74c3c;
}

.address-actions .btn-delete:active {
  background: #fff5f5;
  transform: translateY(1px);
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
  font-size: 16px;
  text-align: center;
}

.empty::before {
  content: '📦';
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* 添加地址按钮 */
.bottom-bar .btn-add {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #548163 0%, #456a52 100%);
  color: white;
  border: none;
  border-radius: 28px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(84, 129, 99, 0.3);
}

.bottom-bar .btn-add:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(84, 129, 99, 0.2);
  opacity: 0.95;
}
</style>
