import request, { getCached, getWithoutCache } from "@/utils/request";

/**
 * 聊天API服务
 */

// 获取指定用户的聊天历史
export function getChatHistory(userId: string) {
  return request({
    url: `/api/messages/${userId}`,
    method: "get",
  });
}

// 获取用户的所有聊天会话
export function getChatSessions() {
  return request({
    url: "/api/chat/sessions",
    method: "get",
  });
}

// 获取未读消息数量
export function getUnreadCount() {
  return request({
    url: "/api/chat/unread",
    method: "get",
  });
}

// 标记与某用户的所有消息为已读
export function markAllAsRead(userId: string) {
  return request({
    url: `/api/messages/read/${userId}`,
    method: "put",
  });
}

// 上传图片消息
export function uploadImage(formData: FormData) {
  return request({
    url: "/api/messages/upload",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 获取聊天设置
export function getChatSettings() {
  return request({
    url: "/api/users/settings/chat",
    method: "get",
  });
}

// 更新聊天设置
export function updateChatSettings(settings: any) {
  return request({
    url: "/api/users/settings/chat",
    method: "put",
    data: settings,
  });
}

// 获取好友列表
export function getFriendsList() {
  return request.get("/api/friends/list");
}

// 获取好友列表 (强制刷新)
export function getFriendsListNoCache() {
  return getWithoutCache("/api/friends/list");
}

// 发送好友请求
export function sendFriendRequest(username: string) {
  return request({
    url: "/api/friends/request",
    method: "post",
    data: { username },
  });
}

// 获取待处理的好友请求
export function getPendingFriendRequests() {
  return request({
    url: "/api/friends/requests/pending",
    method: "get",
  });
}

// 接受好友请求
export function acceptFriendRequest(requestId: string) {
  return request({
    url: `/api/friends/requests/${requestId}/accept`,
    method: "put",
  });
}

// 拒绝好友请求
export function rejectFriendRequest(requestId: string) {
  return request({
    url: `/api/friends/requests/${requestId}/reject`,
    method: "put",
  });
}

export default {
  getChatHistory,
  getChatSessions,
  getUnreadCount,
  markAllAsRead,
  uploadImage,
  getChatSettings,
  updateChatSettings,
  getFriendsList,
  getFriendsListNoCache,
  sendFriendRequest,
  getPendingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
};
