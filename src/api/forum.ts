import request, { getCached, getWithoutCache } from "@/utils/request";

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

  // 使用缓存版本的请求，5分钟缓存
  return getCached(
    "/api/forum/posts",
    { ...params, tags: tagsParam },
    5 * 60 * 1000
  );
};

// 获取帖子列表（不使用缓存）
export const getPostsWithoutCache = (params: {
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

  // 直接请求，不使用缓存
  return getWithoutCache("/api/forum/posts", { ...params, tags: tagsParam });
};

// 获取帖子详情
export const getPostById = (id: string) => {
  // 使用缓存版本的请求，5分钟缓存
  return getCached(`/api/forum/posts/${id}`, null, 5 * 60 * 1000);
};

// 获取帖子详情（不使用缓存）
export const getPostByIdWithoutCache = (id: string) => {
  // 直接请求，不使用缓存
  return getWithoutCache(`/api/forum/posts/${id}`, null);
};

// 创建帖子
export const createPost = (data: {
  content: string;
  tags?: string[];
  anonymous?: boolean;
}) => {
  return request.post("/api/forum/posts", data);
};

// 点赞帖子
export const likePost = (id: string) => {
  return request.post(`/api/forum/posts/${id}/like`);
};

// 反对帖子
export const dislikePost = (id: string) => {
  return request.post(`/api/forum/posts/${id}/dislike`);
};

// 删除帖子
export const deletePost = (id: string) => {
  return request.delete(`/api/forum/posts/${id}`);
};

// 获取帖子评论
export const getPostComments = (
  id: string,
  params: { page?: number; limit?: number } = {}
) => {
  // 使用缓存版本的请求，3分钟缓存
  return getCached(`/api/forum/posts/${id}/comments`, params, 3 * 60 * 1000);
};

// 获取帖子评论（不使用缓存）
export const getPostCommentsWithoutCache = (
  id: string,
  params: { page?: number; limit?: number } = {}
) => {
  // 直接请求，不使用缓存
  return getWithoutCache(`/api/forum/posts/${id}/comments`, params);
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
  return request.post(`/api/forum/posts/${postId}/comments`, data);
};

// 点赞评论
export const likeComment = (id: string) => {
  return request.post(`/api/forum/comments/${id}/like`);
};

// 删除评论
export const deleteComment = (id: string) => {
  return request.delete(`/api/forum/comments/${id}`);
};

// 获取所有标签
export const getAllTags = () => {
  // 使用缓存版本的请求，30分钟缓存
  return getCached("/api/forum/tags", null, 30 * 60 * 1000);
};

// 获取所有标签（不使用缓存）
export const getAllTagsWithoutCache = () => {
  // 直接请求，不使用缓存
  return getWithoutCache("/api/forum/tags", null);
};
