import request from "@/utils/request";

// 获取帖子列表
export const getPosts = (params: {
  page?: number;
  limit?: number;
  filter?: "latest" | "hot" | "recommended";
  tags?: string | string[];
}) => {
  // 如果tags是数组，转换为逗号分隔的字符串
  let tagsParam = params.tags;
  if (Array.isArray(tagsParam)) {
    tagsParam = tagsParam.join(",");
  }

  return request({
    url: "/api/forum/posts",
    method: "get",
    params: {
      ...params,
      tags: tagsParam,
    },
  }).then((res) => res.data);
};

// 获取帖子详情
export const getPostById = (id: string) => {
  return request({
    url: `/api/forum/posts/${id}`,
    method: "get",
  }).then((res) => res.data);
};

// 创建帖子
export const createPost = (data: {
  content: string;
  tags?: string[];
  anonymous?: boolean;
}) => {
  return request({
    url: "/api/forum/posts",
    method: "post",
    data,
  }).then((res) => res.data);
};

// 点赞帖子
export const likePost = (id: string) => {
  return request({
    url: `/api/forum/posts/${id}/like`,
    method: "post",
  }).then((res) => res.data);
};

// 反对帖子
export const dislikePost = (id: string) => {
  return request({
    url: `/api/forum/posts/${id}/dislike`,
    method: "post",
  }).then((res) => res.data);
};

// 删除帖子
export const deletePost = (id: string) => {
  return request({
    url: `/api/forum/posts/${id}`,
    method: "delete",
  }).then((res) => res.data);
};

// 获取帖子评论
export const getPostComments = (
  id: string,
  params: { page?: number; limit?: number } = {}
) => {
  return request({
    url: `/api/forum/posts/${id}/comments`,
    method: "get",
    params,
  }).then((res) => res.data);
};

// 添加评论
export const createComment = (
  postId: string,
  data: {
    content: string;
    anonymous?: boolean;
    parentCommentId?: string;
    replyToUserId?: string;
  }
) => {
  return request({
    url: `/api/forum/posts/${postId}/comments`,
    method: "post",
    data,
  }).then((res) => res.data);
};

// 点赞评论
export const likeComment = (id: string) => {
  return request({
    url: `/api/forum/comments/${id}/like`,
    method: "post",
  }).then((res) => res.data);
};

// 删除评论
export const deleteComment = (id: string) => {
  return request({
    url: `/api/forum/comments/${id}`,
    method: "delete",
  }).then((res) => res.data);
};

// 获取所有标签
export const getAllTags = () => {
  return request({
    url: "/api/forum/tags",
    method: "get",
  }).then((res) => res.data);
};
