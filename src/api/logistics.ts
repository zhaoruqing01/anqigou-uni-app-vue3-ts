import request from '@/utils/request';

/**
 * 物流轨迹信息
 */
export interface LogisticsTrack {
  operateTime: number;
  operateCity: string;
  operateLocation: string;
  description: string;
  courierName?: string;
  courierPhone?: string;
  isLatest: boolean;
  longitude?: number; // 经度（可选）
  latitude?: number; // 纬度（可选）
}

/**
 * 物流详情信息
 */
export interface LogisticsDetail {
  id: string;
  orderNo: string;
  courierCompany: string;
  trackingNo: string;
  senderInfo: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  status: string;
  statusDesc: string;
  shippedTime?: number;
  signedTime?: number;
  tracks: LogisticsTrack[];
  hasEvaluated: boolean;
}

/**
 * 物流评价参数
 */
export interface LogisticsEvaluateParams {
  logisticsId: string;
  speedRating: number;
  serviceRating: number;
  qualityRating: number;
  content?: string;
  images?: string;
}

/**
 * 快递100 API配置
 */
const KUAIDI100_CONFIG = {
  appKey: 'EQSKhWGU7976', // 快递100 API Key
  customer: 'D5D0F76F915DDC37AE25DE6FB1E17441', // 快递100 客户编号
  secret: 'EQSKhWGU7976', // 快递100 API密钥
  queryUrl: 'https://poll.kuaidi100.com/poll/query.do', // 快递100 实时查询接口
  maptrackUrl: 'https://poll.kuaidi100.com/poll/maptrack.do', // 快递100 地图轨迹接口
};

/**
 * 生成快递100签名
 * @param param 业务参数JSON字符串
 * @param timestamp 时间戳
 */
function generateKuaidi100Sign(param: string, timestamp: string): string {
  const signStr = `${param}${timestamp}${KUAIDI100_CONFIG.customer}${KUAIDI100_CONFIG.secret}`;
  return require('crypto-js').MD5(signStr).toUpperCase();
}

/**
 * 快递公司名称到编码的映射
 */
const COMPANY_CODE_MAP: Record<string, string> = {
  顺丰: 'sf',
  中通: 'zto',
  圆通: 'yto',
  申通: 'sto',
  韵达: 'yd',
  百世: 'htky',
  邮政: 'ems',
  京东: 'jd',
};

/**
 * 获取快递公司编码
 * @param companyName 快递公司名称
 */
export function getCompanyCode(companyName: string): string {
  return COMPANY_CODE_MAP[companyName] || companyName;
}

/**
 * 直接调用快递100 API获取物流轨迹
 * @param com 快递公司编码
 * @param num 快递单号
 */
export function getKuaidi100Tracks(com: string, num: string): Promise<LogisticsTrack[]> {
  // 构建请求参数
  const param = {
    com,
    num,
    from: '',
    to: '',
    resultv2: 1, // 返回完整轨迹信息
  };
  const paramStr = JSON.stringify(param);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sign = generateKuaidi100Sign(paramStr, timestamp);

  // 构建请求数据
  const requestData = {
    param: paramStr,
    sign,
    t: timestamp,
    customer: KUAIDI100_CONFIG.customer,
  };

  return new Promise((resolve, reject) => {
    // 使用wx.request直接调用快递100 API
    uni.request({
      url: KUAIDI100_CONFIG.queryUrl,
      method: 'POST',
      data: requestData,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data as any;
          if (data.resultcode === '200') {
            // 解析轨迹数据
            const tracks: LogisticsTrack[] = [];
            const result = data.result;
            if (result && result.list) {
              // 转换快递100返回格式
              for (let i = 0; i < result.list.length; i++) {
                const trackItem = result.list[i];
                // 解析时间
                const ftime = trackItem.ftime;
                let operateTime = 0;
                try {
                  // 将时间字符串转换为时间戳
                  const date = new Date(ftime);
                  operateTime = date.getTime();
                } catch (error) {
                  console.error('解析时间失败:', error);
                  operateTime = Date.now();
                }

                // 构建轨迹对象
                const track: LogisticsTrack = {
                  operateTime,
                  operateCity: trackItem.location || '',
                  operateLocation: '',
                  description: trackItem.context || '',
                  courierName: '',
                  courierPhone: '',
                  isLatest: i === 0, // 第一条是最新的
                };
                tracks.push(track);
              }
            }
            resolve(tracks);
          } else {
            reject(new Error(data.message || '快递100 API调用失败'));
          }
        } else {
          reject(new Error(`请求失败，状态码：${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * 获取物流详情
 * @param orderId 订单ID
 */
export function getLogisticsDetail(orderId: string): Promise<LogisticsDetail> {
  return request<LogisticsDetail>({
    url: `/api/logistics/order/${orderId}`,
    method: 'GET',
  }).then((res) => res.data);
}

/**
 * 获取物流轨迹
 * @param logisticsId 物流ID
 */
export function getLogisticsTracks(logisticsId: string) {
  return request<LogisticsTrack[]>({
    url: `/api/logistics/tracks/${logisticsId}`,
    method: 'GET',
  });
}

/**
 * 评价物流
 * @param params 评价参数
 */
export function evaluateLogistics(params: LogisticsEvaluateParams) {
  return request({
    url: '/api/logistics/evaluate',
    method: 'POST',
    data: params,
  });
}
