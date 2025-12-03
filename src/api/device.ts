import request from '@/utils/request';

/**
 * 用户设备API
 */

// 获取设备列表
export const listDevices = () => {
  return request.get('/api/device/list');
};

// 下线指定设备
export const offlineDevice = (deviceId: string) => {
  return request.post(`/api/device/offline/${deviceId}`);
};

// 下线除当前设备外的所有设备
export const offlineOtherDevices = (currentDeviceToken: string) => {
  return request.post('/api/device/offline-others', {
    params: {
      currentDeviceToken,
    },
  });
};
