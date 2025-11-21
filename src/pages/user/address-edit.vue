<template>
  <view class="address-edit">
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input v-model="form.receiverName" placeholder="请输入收货人姓名" />
      </view>

      <view class="form-item">
        <text class="label">手机号码</text>
        <input
          v-model="form.receiverPhone"
          type="number"
          placeholder="请输入手机号码"
          maxlength="11"
        />
      </view>

      <view class="form-item" @click="chooseRegion">
        <text class="label">所在地区</text>
        <input v-model="regionText" disabled placeholder="请选择省市区" />
        <text class="arrow">›</text>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          v-model="form.detailAddress"
          placeholder="街道门牌、楼层房间号等信息"
          maxlength="200"
        ></textarea>
      </view>

      <view class="form-item checkbox-item">
        <checkbox :checked="form.isDefault" @change="form.isDefault = !form.isDefault" />
        <text>设为默认地址</text>
      </view>
    </view>

    <view class="button-group">
      <button class="btn-submit" @click="handleSubmit">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

interface AddressForm {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: boolean;
}

const form = ref<AddressForm>({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
});

const regionText = computed(() => {
  if (form.value.province && form.value.city && form.value.district) {
    return `${form.value.province} ${form.value.city} ${form.value.district}`;
  }
  return '';
});

onMounted(() => {
  const addressId = getAddressId();
  if (addressId) {
    loadAddressDetail(addressId);
  }
});

const getAddressId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.id || '';
};

const loadAddressDetail = async (id: string) => {
  try {
    // TODO: 调用API获取地址详情
    // 模拟数据
    form.value = {
      receiverName: '张三',
      receiverPhone: '13800000001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detailAddress: 'xxx街道xxx号',
      isDefault: true,
    };
  } catch (error) {
    console.error('加载地址详情失败', error);
  }
};

const chooseRegion = () => {
  uni.showActionSheet({
    itemList: ['北京市', '上海市', '广东省', '浙江省'],
    success: (res) => {
      const provinces = ['北京市', '上海市', '广东省', '浙江省'];
      form.value.province = provinces[res.tapIndex];
      form.value.city = provinces[res.tapIndex]; // 简化处理
      form.value.district = '朝阳区'; // 简化处理
    },
  });
};

const handleSubmit = () => {
  if (!form.value.receiverName) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' });
    return;
  }
  if (!form.value.receiverPhone || !/^1[3-9]\d{9}$/.test(form.value.receiverPhone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }
  if (!form.value.province || !form.value.city || !form.value.district) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' });
    return;
  }
  if (!form.value.detailAddress) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' });
    return;
  }

  // TODO: 调用API保存地址
  uni.showToast({
    title: '保存成功',
    icon: 'success',
    success: () => {
      setTimeout(() => {
        uni.navigateBack();
      }, 500);
    },
  });
};
</script>

<style scoped lang="scss">
.address-edit {
  min-height: 100vh;
  background: #f8f9ff;
  padding: 12px;
  padding-bottom: 80px;
}

.form {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  min-height: 50px;
}

.form-item:last-child {
  border-bottom: none;
}

.label {
  min-width: 80px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

input,
textarea {
  flex: 1;
  font-size: 14px;
  color: #333;
  border: none;
  background: transparent;
}

input::placeholder,
textarea::placeholder {
  color: #999;
}

input:disabled,
textarea:disabled {
  color: #333;
}

textarea {
  min-height: 60px;
  padding: 8px 0;
  line-height: 1.5;
}

.arrow {
  font-size: 20px;
  color: #999;
  margin-left: 8px;
}

.checkbox-item {
  gap: 8px;
  padding-left: 16px;
}

.checkbox-item text {
  font-size: 14px;
  color: #666;
}

.button-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
}

.btn-submit {
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

.btn-submit:active {
  opacity: 0.9;
}
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
}

.form-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: 20px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
}

input::placeholder,
textarea::placeholder {
  color: #999;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #548163;
  background: white;
}

input:disabled,
textarea:disabled {
  background: #f5f5f5;
  color: #999;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-item text {
  font-size: 14px;
  color: #333;
}

.delete-section {
  padding: 0 16px;
}

.btn-delete {
  width: 100%;
  padding: 14px;
  background: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-delete:active {
  background: #ffebee;
}

.btn-save {
  width: 100%;
  padding: 14px;
  background: #548163;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

.btn-save:active {
  background: #456a52;
}
</style>
