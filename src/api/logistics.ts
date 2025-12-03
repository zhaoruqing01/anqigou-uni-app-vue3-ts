import request from "@/utils/request";

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
 * 获取物流详情
 * @param orderId 订单ID
 */
export function getLogisticsDetail(orderId: string): Promise<LogisticsDetail> {
  return request<LogisticsDetail>({
    url: `/api/logistics/order/${orderId}`,
    method: "GET",
  }).then((res) => res.data);
}

/**
 * 获取物流轨迹
 * @param logisticsId 物流ID
 */
export function getLogisticsTracks(logisticsId: string) {
  return request<LogisticsTrack[]>({
    url: `/api/logistics/tracks/${logisticsId}`,
    method: "GET",
  });
}

/**
 * 评价物流
 * @param params 评价参数
 */
export function evaluateLogistics(params: LogisticsEvaluateParams) {
  return request({
    url: "/api/logistics/evaluate",
    method: "POST",
    data: params,
  });
}
