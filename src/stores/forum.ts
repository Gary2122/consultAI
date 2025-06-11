import { defineStore } from "pinia";
import * as api from "@/api/forum";
import { ApiResponse } from "@/utils/request";
import { da } from "element-plus/es/locale/index.mjs";

// 标签接口
export interface Tag {
  _id: string;
  name: string;
  color: string;
  description?: string;
}

// 作者接口
export interface Author {
  _id: string;
  username: string;
  avatar?: string;
}

// 评论接口
export interface Comment {
  _id: string;
  content: string;
  author: Author | null;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  updatedAt?: string;
  replyTo?: string; // 回复的评论ID
}

// 帖子接口
export interface Post {
  _id: string;
  title: string;
  content: string;
  author: Author | null;
  isAnonymous: boolean;
  tags: Tag[];
  likes: number;
  dislikes: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
}

// 元数据接口
export interface MetadataType {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ForumState {
  tags: Tag[];
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  isLoadingTags: boolean;
  isLoadingPosts: boolean;
  isLoadingComments: boolean;
  isSubmittingPost: boolean;
  isSubmittingComment: boolean;
  metadata: MetadataType;
  error: string | null;
  lastTagsUpdate: number;
  lastPostsUpdate: number;
  lastCommentsUpdate: Record<string, number>; // 记录每个帖子评论的最后更新时间
}

export const useForumStore = defineStore("forum", {
  state: (): ForumState => ({
    tags: [],
    posts: [],
    currentPost: null,
    comments: [],
    isLoadingTags: false,
    isLoadingPosts: false,
    isLoadingComments: false,
    isSubmittingPost: false,
    isSubmittingComment: false,
    metadata: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    },
    error: null,
    lastTagsUpdate: 0,
    lastPostsUpdate: 0,
    lastCommentsUpdate: {},
  }),

  getters: {
    // 获取所有标签
    getAllTags: (state) => state.tags,

    // 获取所有帖子
    getAllPosts: (state) => state.posts,

    // 获取当前帖子
    getCurrentPost: (state) => state.currentPost,

    // 获取当前帖子的评论
    getComments: (state) => state.comments,

    // 获取分页元数据
    getMetadata: (state) => state.metadata,

    // 是否有更多页
    hasMorePages: (state) => state.metadata.page < state.metadata.pages,

    // 按ID获取帖子
    getPostById: (state) => (id: string) =>
      state.posts.find((post) => post._id === id),
  },

  actions: {
    // 获取所有标签
    async fetchTags(forceRefresh = false) {
      // 检查是否需要更新
      const now = Date.now();
      const TAGS_CACHE_TIME = 60 * 60 * 1000; // 标签缓存1小时
      const shouldRefresh =
        forceRefresh || now - this.lastTagsUpdate > TAGS_CACHE_TIME;

      // 如果已有数据且不需要刷新，直接返回
      if (this.tags.length > 0 && !shouldRefresh) {
        return this.tags;
      }

      this.isLoadingTags = true;
      this.error = null;

      try {
        const response = await api.getAllTags();

        if (response.success) {
          this.tags = response.data;
          this.lastTagsUpdate = now;
          return this.tags;
        } else {
          throw new Error(response.message || "获取标签失败");
        }
      } catch (error: any) {
        console.error("获取标签失败:", error);
        this.error = error.message;
        return [];
      } finally {
        this.isLoadingTags = false;
      }
    },

    // 获取帖子列表
    async fetchPosts(
      params: {
        page?: number;
        limit?: number;
        search?: string;
        tags?: string[] | string;
        forceRefresh?: boolean;
      } = {}
    ) {
      const {
        page = 1,
        limit = 10,
        search = "",
        tags = "",
        forceRefresh = false,
      } = params;

      // 检查是否需要更新
      const now = Date.now();
      const POSTS_CACHE_TIME = 5 * 60 * 1000; // 帖子缓存5分钟
      const shouldRefresh =
        forceRefresh || now - this.lastPostsUpdate > POSTS_CACHE_TIME;

      // 如果已有数据且不需要刷新且是第一页，直接返回
      if (this.posts.length > 0 && !shouldRefresh && page === 1) {
        console.log("this.posts", this.posts);
        return { posts: this.posts, metadata: this.metadata };
      }

      this.isLoadingPosts = true;
      this.error = null;

      try {
        const response = forceRefresh
          ? await api.getPostsWithoutCache({
              page,
              limit,
              filter: search ? "latest" : undefined,
              tags,
            })
          : await api.getPosts({
              page,
              limit,
              filter: search ? "latest" : undefined,
              tags,
            });
        console.log("response", response);
        if (response.success) {
          // 解析返回数据
          const { data, total, totalPages, currentPage, count } = response;

          // 更新状态
          this.posts = data;
          //   this.metadata = metadata;
          this.lastPostsUpdate = now;

          return { data, total, totalPages, currentPage, count };
        } else {
          throw new Error(response.message || "获取帖子列表失败");
        }
      } catch (error: any) {
        console.error("获取帖子列表失败:", error);
        this.error = error.message;
        return { posts: [], metadata: this.metadata };
      } finally {
        this.isLoadingPosts = false;
      }
    },

    // 获取帖子详情
    async fetchPostDetails(postId: string, forceRefresh = false) {
      // 检查当前是否已有该帖子且不需要刷新
      if (
        this.currentPost &&
        this.currentPost._id === postId &&
        !forceRefresh
      ) {
        return this.currentPost;
      }

      this.isLoadingPosts = true;
      this.error = null;

      try {
        const response = await api.getPostById(postId);

        if (response.success) {
          this.currentPost = response.data;
          return this.currentPost;
        } else {
          throw new Error(response.message || "获取帖子详情失败");
        }
      } catch (error: any) {
        console.error("获取帖子详情失败:", error);
        this.error = error.message;
        return null;
      } finally {
        this.isLoadingPosts = false;
      }
    },

    // 创建新帖子
    async createPost(postData: {
      title: string;
      content: string;
      tags?: string[];
      isAnonymous?: boolean;
    }) {
      this.isSubmittingPost = true;
      this.error = null;

      try {
        // API接口中 isAnonymous 对应的是 anonymous
        const apiPostData = {
          title: postData.title,
          content: postData.content,
          tags: postData.tags,
          anonymous: postData.isAnonymous,
        };

        const response = await api.createPost(apiPostData as any);

        if (response.success) {
          // 添加新帖子到列表开头
          if (this.posts.length > 0) {
            this.posts.unshift(response.data);
          }
          return response.data;
        } else {
          throw new Error(response.message || "创建帖子失败");
        }
      } catch (error: any) {
        console.error("创建帖子失败:", error);
        this.error = error.message;
        return null;
      } finally {
        this.isSubmittingPost = false;
      }
    },

    // 点赞帖子
    async likePost(postId: string) {
      try {
        const response = await api.likePost(postId);

        if (response.success) {
          const { data } = response;
          // 更新当前帖子
          if (this.currentPost && this.currentPost._id === postId) {
            if (data.liked) {
              this.currentPost.likes += 1;
            } else {
              this.currentPost.likes -= 1;
            }
          }

          // 更新帖子列表中的帖子
          const post = this.posts.find((p) => p._id === postId);
          if (post) {
            if (data.liked) {
              post.likes += 1;
            } else {
              post.likes -= 1;
            }
          }

          return {
            success: true,
            message: data.liked ? "点赞成功" : "取消点赞成功",
          };
        } else {
          throw new Error(response.message || "点赞失败");
        }
      } catch (error: any) {
        console.error("点赞失败:", error);
        this.error = error.message;
        return {
          success: false,
          message: "点赞失败",
        };
      }
    },

    // 取消点赞帖子
    async dislikePost(postId: string) {
      try {
        const response = await api.dislikePost(postId);

        if (response.success) {
          // 更新当前帖子
          if (this.currentPost && this.currentPost._id === postId) {
            this.currentPost.dislikes += 1;
          }

          // 更新帖子列表中的帖子
          const post = this.posts.find((p) => p._id === postId);
          if (post) {
            post.dislikes += 1;
          }

          return true;
        } else {
          throw new Error(response.message || "取消点赞失败");
        }
      } catch (error: any) {
        console.error("取消点赞失败:", error);
        this.error = error.message;
        return false;
      }
    },

    // 删除帖子
    async deletePost(postId: string) {
      try {
        const response = await api.deletePost(postId);

        if (response.success) {
          // 从列表中移除帖子
          this.posts = this.posts.filter((post) => post._id !== postId);

          // 如果当前帖子被删除，清空当前帖子
          if (this.currentPost && this.currentPost._id === postId) {
            this.currentPost = null;
          }

          return true;
        } else {
          throw new Error(response.message || "删除帖子失败");
        }
      } catch (error: any) {
        console.error("删除帖子失败:", error);
        this.error = error.message;
        return false;
      }
    },

    // 获取帖子评论
    async fetchComments(
      postId: string,
      params: {
        page?: number;
        limit?: number;
        forceRefresh?: boolean;
      } = {}
    ) {
      const { page = 1, limit = 10, forceRefresh = false } = params;

      // 检查是否需要更新
      const now = Date.now();
      const COMMENTS_CACHE_TIME = 2 * 60 * 1000; // 评论缓存2分钟
      const lastUpdate = this.lastCommentsUpdate[postId] || 0;
      const shouldRefresh =
        forceRefresh || now - lastUpdate > COMMENTS_CACHE_TIME;

      this.isLoadingComments = true;
      this.error = null;

      try {
        const response = shouldRefresh
          ? await api.getPostCommentsWithoutCache(postId, { page, limit })
          : await api.getPostComments(postId, { page, limit });
        console.log(response);
        if (response.success) {
          this.comments = response.data;
          this.lastCommentsUpdate = {
            ...this.lastCommentsUpdate,
            [postId]: now,
          };
          return response.data;
        } else {
          throw new Error(response.message || "获取评论失败");
        }
      } catch (error: any) {
        console.error("获取评论失败:", error);
        this.error = error.message;
        return { comments: [], metadata: { total: 0, page, limit, pages: 0 } };
      } finally {
        this.isLoadingComments = false;
      }
    },

    // 创建评论
    async createComment(
      postId: string,
      commentData: {
        content: string;
        isAnonymous?: boolean;
        replyTo?: string;
      }
    ) {
      this.isSubmittingComment = true;
      this.error = null;

      try {
        // API接口中 isAnonymous 对应的是 anonymous
        const apiCommentData = {
          content: commentData.content,
          anonymous: commentData.isAnonymous,
          replyTo: commentData.replyTo,
        };

        const response = await api.createComment(postId, apiCommentData as any);
        console.log(response);
        if (response.success) {
          // // 确保comments数组已初始化
          // if (!Array.isArray(this.comments)) {
          //   this.comments = [];
          // }
          // console.log(response.data, this.comments);
          // // 添加新评论到列表
          // this.comments.unshift(response.data);

          // // 更新帖子评论数量
          // if (this.currentPost && this.currentPost._id === postId) {
          //   this.currentPost.commentCount += 1;
          // }

          // // 更新帖子列表中的评论数量
          // const post = this.posts.find((p) => p._id === postId);
          // if (post) {
          //   post.commentCount += 1;
          // }

          return response.data;
        } else {
          throw new Error(response.message || "创建评论失败");
        }
      } catch (error: any) {
        console.error("创建评论失败:", error);
        this.error = error.message;
        return null;
      } finally {
        this.isSubmittingComment = false;
      }
    },

    // 点赞评论
    async likeComment(commentId: string) {
      try {
        const response = await api.likeComment(commentId);

        if (response.success) {
          // 更新评论列表中的点赞数
          const comment = this.comments.find((c) => c._id === commentId);
          if (comment) {
            comment.likes += 1;
          }

          return true;
        } else {
          throw new Error(response.message || "点赞评论失败");
        }
      } catch (error: any) {
        console.error("点赞评论失败:", error);
        this.error = error.message;
        return false;
      }
    },

    // 删除评论
    async deleteComment(commentId: string, postId: string) {
      try {
        const response = await api.deleteComment(commentId);

        if (response.success) {
          // 从列表中移除评论
          this.comments = this.comments.filter(
            (comment) => comment._id !== commentId
          );

          // 更新帖子评论数量
          if (this.currentPost && this.currentPost._id === postId) {
            this.currentPost.commentCount = Math.max(
              0,
              this.currentPost.commentCount - 1
            );
          }

          // 更新帖子列表中的评论数量
          const post = this.posts.find((p) => p._id === postId);
          if (post) {
            post.commentCount = Math.max(0, post.commentCount - 1);
          }

          return true;
        } else {
          throw new Error(response.message || "删除评论失败");
        }
      } catch (error: any) {
        console.error("删除评论失败:", error);
        this.error = error.message;
        return false;
      }
    },

    // 清除错误
    clearError() {
      this.error = null;
    },

    // 清除缓存
    clearCache() {
      this.lastTagsUpdate = 0;
      this.lastPostsUpdate = 0;
      this.lastCommentsUpdate = {};
    },
  },
});
