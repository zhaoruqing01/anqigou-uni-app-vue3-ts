import request from "@/utils/request";

/**
 * 反馈API
 * 用于处理用户反馈相关的请求
 */

// 提交反馈
export const submitFeedback = (data: {
  type: string;
  title: string;
  content: string;
  contactInfo?: string;
  images?: string;
}) => {
  return request.post("/feedback", data);
};

// 获取用户反馈列表
export const getUserFeedbackList = (params: { page: number; size: number }) => {
  return request.get("/feedback/list", { params });
};

// 获取反馈详情
export const getFeedbackDetail = (feedbackId: string) => {
  return request.get("/feedback/detail", { params: { feedbackId } });
};
