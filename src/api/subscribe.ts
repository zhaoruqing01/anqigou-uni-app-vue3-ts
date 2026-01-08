import request from '@/utils/request';

export const saveSubscribeStatus = (data: {
  orderId: string;
  templateId: string;
  status: string;
}) => {
  return request({
    url: '/api/subscribe/save',
    method: 'POST',
    data,
  });
};
