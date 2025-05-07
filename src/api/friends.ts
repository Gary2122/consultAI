import request from "@/utils/request";

/**
 * 好友系统API服务
 */

// 搜索用户（通过用户名或邮箱）
export function searchUsers(query: string) {
  return request({
    url: `/api/friends/search`,
    method: "get",
    params: { query },
  });
}

// 发送好友请求
export function sendFriendRequest(userId: string | number) {
  return request({
    url: `/api/friends/request/${userId}`,
    method: "post",
  });
}

// 接受好友请求
export function acceptFriendRequest(requestId: string | number) {
  return request({
    url: `/api/friends/accept/${requestId}`,
    method: "put",
  });
}

// 拒绝好友请求
export function rejectFriendRequest(requestId: string | number) {
  return request({
    url: `/api/friends/reject/${requestId}`,
    method: "put",
  });
}

// 获取好友列表
export function getFriendsList() {
  return request({
    url: "/api/friends/list",
    method: "get",
  });
}

// 获取待处理的好友请求
export function getFriendRequests() {
  return request({
    url: "/api/friends/requests",
    method: "get",
  });
}
