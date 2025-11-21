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
import { onMounted, ref } from 'vue';

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

onMounted(() => {
  loadAddressList();
});

const loadAddressList = async () => {
  try {
    // TODO: 调用API获取地址列表
    // 模拟数据
    addressList.value = [
      {
        id: '1',
        receiverName: '张三',
        receiverPhone: '138****0001',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        detailAddress: 'xxx街道xxx号',
        fullAddress: '北京市 北京市 朝阳区 xxx街道xxx号',
        isDefault: true,
      },
      {
        id: '2',
        receiverName: '李四',
        receiverPhone: '139****0002',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        detailAddress: 'yyy路yyy号',
        fullAddress: '上海市 上海市 浦东新区 yyy路yyy号',
        isDefault: false,
      },
    ];
  } catch (error) {
    console.error('加载地址列表失败', error);
  }
};

const selectAddress = (address: Address) => {
  // 如果是从订单页面跳转过来，选择地址后返回
  const pages = getCurrentPages();
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2] as any;
    if (prevPage.route && prevPage.route.includes('checkout')) {
      // 设置页面数据并返回
      const currentPage = pages[pages.length - 1] as any;
      if (!currentPage.pageData) currentPage.pageData = {};
      currentPage.pageData.selectedAddress = address;
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

const deleteAddress = (id: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        addressList.value = addressList.value.filter((a) => a.id !== id);
        uni.showToast({ title: '删除成功', icon: 'success' });
        // TODO: 调用API删除地址
      }
    },
  });
};
</script>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.add-btn {
  background: #548163;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
}

.address-list {
  margin-bottom: 80px;
}

.address-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.address-card:active {
  transform: scale(0.99);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.recipient {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.phone {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.address {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.tag-list {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f0f0f0;
  color: #666;
}

.default-tag {
  background: #548163;
  color: white;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.address-actions button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.address-actions .btn-edit {
  color: #333;
}

.address-actions .btn-edit:active {
  background: #f5f5f5;
}

.address-actions .btn-delete {
  color: #e74c3c;
  border-color: #e74c3c;
}

.address-actions .btn-delete:active {
  background: #ffebee;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.bottom-bar .btn-add {
  width: 100%;
  padding: 14px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.bottom-bar .btn-add:active {
  background: #456a52;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

.bottom-bar {
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);

  .btn-add {
    width: 100%;
    padding: 14px;
    background: #548163;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }
  }
}
</style>
