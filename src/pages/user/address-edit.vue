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

      <!-- 省市区选择 -->
      <view class="form-item" @click="showRegionPicker">
        <text class="label">所在地区</text>
        <view class="region-text">
          <text v-if="regionText" class="selected-region">{{ regionText }}</text>
          <text v-else class="placeholder">请选择省/市/区</text>
        </view>
        <text><uni-icons type="right" size="20"></uni-icons></text>
      </view>

      <!-- 省市区选择弹窗 -->
      <uni-popup ref="regionPopup" type="bottom">
        <view class="popup-header">
          <text class="cancel-btn" @click="closeRegionPicker">取消</text>
          <text class="confirm-btn" @click="confirmRegion">确定</text>
        </view>
        <picker-view class="region-picker" :value="regionValue" @change="onRegionChange">
          <picker-view-column>
            <view class="picker-item" v-for="(province, index) in provinces" :key="index">
              {{ province.name }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(city, index) in cities" :key="index">
              {{ city.name }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(district, index) in districts" :key="index">
              {{ district.name }}
            </view>
          </picker-view-column>
        </picker-view>
      </uni-popup>

      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          v-model="form.detailAddress"
          placeholder="街道门牌、楼层房间号等信息"
          maxlength="200"
          style="height: 12px"
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
import { fetchAreaData } from '@/api/address-json';
import request from '@/utils/request';
import { computed, onMounted, ref } from 'vue';

interface AddressForm {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: boolean;
  areaList: any[];
}

const form = ref<AddressForm>({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
  areaList: [],
});

// 省市区选择相关数据
const regionPopup = ref<any>(null);
const regionValue = ref<number[]>([0, 0, 0]);
const provinces = ref<any[]>([]);
const cities = ref<any[]>([]);
const districts = ref<any[]>([]);

// 计算属性：显示已选择的省市区文本
const regionText = computed(() => {
  if (form.value.province && form.value.city && form.value.district) {
    return `${form.value.province} ${form.value.city} ${form.value.district}`;
  }
  return '';
});

onMounted(() => {
  const addressId = getAddressId();
  getAreaData();
  if (addressId) {
    loadAddressDetail(addressId);
  }
});

// 获取省市区的数据
const getAreaData = async () => {
  try {
    const areaList = await fetchAreaData();
    form.value.areaList = areaList;
    provinces.value = areaList;

    // 初始化城市和区县数据
    if (areaList.length > 0) {
      cities.value = areaList[0].children || [];
      if (cities.value.length > 0) {
        districts.value = cities.value[0].children || [];
      }
    }
  } catch (error) {
    console.error('获取省市区数据失败', error);
    uni.showToast({ title: '获取省市区数据失败', icon: 'error' });
  }
};

// 省市区选择器变更事件
const onRegionChange = (e: any) => {
  const val = e.detail.value;
  regionValue.value = val;

  // 更新城市列表
  if (provinces.value[val[0]] && provinces.value[val[0]].children) {
    cities.value = provinces.value[val[0]].children;
  } else {
    cities.value = [];
  }

  // 更新区县列表
  if (cities.value[val[1]] && cities.value[val[1]].children) {
    districts.value = cities.value[val[1]].children;
  } else {
    districts.value = [];
  }
};

// 显示省市区选择弹窗
const showRegionPicker = () => {
  regionPopup.value?.open();
};

// 关闭省市区选择弹窗
const closeRegionPicker = () => {
  regionPopup.value?.close();
};

// 确认省市区选择
const confirmRegion = () => {
  const [provinceIndex, cityIndex, districtIndex] = regionValue.value;

  if (provinces.value[provinceIndex]) {
    form.value.province = provinces.value[provinceIndex].name;
  }

  if (cities.value[cityIndex]) {
    form.value.city = cities.value[cityIndex].name;
  }

  if (districts.value[districtIndex]) {
    form.value.district = districts.value[districtIndex].name;
  }

  closeRegionPicker();
};

const getAddressId = () => {
  const pages = getCurrentPages() as any;
  const currentPage = pages[pages.length - 1];
  return currentPage?.options?.id || '';
};

const loadAddressDetail = async (id: string) => {
  try {
    const response = await request.get(`/api/user/address/${id}`);
    // @ts-ignore
    if (response.code === 0) {
      form.value = response.data;

      // 如果有省市区数据，需要设置选择器的默认值
      if (form.value.province && form.value.city && form.value.district) {
        // 查找对应的索引
        const provinceIndex = provinces.value.findIndex((p) => p.name === form.value.province);
        if (provinceIndex !== -1) {
          regionValue.value[0] = provinceIndex;

          // 更新城市列表
          if (provinces.value[provinceIndex].children) {
            cities.value = provinces.value[provinceIndex].children;
            const cityIndex = cities.value.findIndex((c) => c.name === form.value.city);
            if (cityIndex !== -1) {
              regionValue.value[1] = cityIndex;

              // 更新区县列表
              if (cities.value[cityIndex].children) {
                districts.value = cities.value[cityIndex].children;
                const districtIndex = districts.value.findIndex(
                  (d) => d.name === form.value.district
                );
                if (districtIndex !== -1) {
                  regionValue.value[2] = districtIndex;
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('加载地址详情失败', error);
    uni.showToast({ title: '加载地址失败', icon: 'error' });
  }
};

const handleSubmit = async () => {
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

  try {
    const addressId = getAddressId();
    const url = addressId ? `/api/user/address/${addressId}` : '/api/user/address';
    const method = addressId ? 'put' : 'post';
    const response = await request[method](url, form.value);

    if (response.code === 0) {
      uni.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            uni.navigateBack();
          }, 500);
        },
      });
    }
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'error' });
  }
};
</script>

<style scoped lang="scss">
/* 小程序样式重置 - 替换通配符选择器 */
page, view, text, button, input, image, navigator, picker, picker-view {
  box-sizing: border-box;
}

/* 主容器 */
.address-edit {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px 16px 100px;
}

/* 表单容器 */
.form {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

/* 表单项 */
.form-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 60px;
  transition: all 0.3s ease;
}

/* 最后一个表单项 */
.form-item:last-child {
  border-bottom: none;
}

/* 标签样式 */
.label {
  min-width: 90px;
  font-size: 15px;
  color: #333;
  font-weight: 600;
  line-height: 1.2;
}

/* 输入框基础样式 */
input,
textarea {
  flex: 1;
  font-size: 16px;
  color: #333;
  border: none;
  background: transparent;
  line-height: 1.4;
  padding: 4px 0;
}

/* 输入框占位符样式 */
input::placeholder,
textarea::placeholder {
  color: #999;
  font-weight: 400;
}

/* 文本域样式 */
textarea {
  min-height: 80px;
  padding: 8px 0;
  line-height: 1.6;
  resize: none;
}

/* 省市区选择文本 */
.region-text {
  flex: 1;
  font-size: 16px;
  color: #333;
  line-height: 1.4;
}

/* 省市区占位符 */
.region-text .placeholder {
  color: #999;
}

/* 省市区已选择文本 */
.region-text .selected-region {
  color: #333;
  font-weight: 500;
}

/* 复选框项 */
.checkbox-item {
  gap: 12px;
  padding-left: 20px;
  justify-content: flex-start;
}

/* 复选框文本 */
.checkbox-item text {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

/* 底部按钮组 */
.button-group {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* 保存按钮 */
.btn-submit {
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

/* 保存按钮点击效果 */
.btn-submit:active {
  transform: translateY(2px);
  box-shadow: 0 2px 8px rgba(84, 129, 99, 0.2);
  opacity: 0.95;
}

/* 省市区选择弹窗 */
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

/* 弹窗按钮 */
.cancel-btn,
.confirm-btn {
  font-size: 16px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 取消按钮 */
.cancel-btn {
  color: #999;
}

/* 确认按钮 */
.confirm-btn {
  color: #548163;
}

/* 省市区选择器 */
.region-picker {
  height: 280px;
  background: #fff;
}

/* 选择器选项 */
.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}
</style>
