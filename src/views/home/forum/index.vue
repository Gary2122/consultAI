<!--
 * @Descripttion: 
 * @version: 
 * @Author: Garrison
 * @Date: 2025-04-29 15:28:06
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-06 11:54:26
-->
<template>
  <div class="forum-container">
    <!-- 页面头部 -->
    <div class="forum-header">
      <div class="forum-title">
        <i class="el-icon-chat-dot-round"></i>
        <h1>心理树洞</h1>
      </div>
      <div class="header-desc">在这里畅所欲言，所有发言均为匿名</div>

      <div class="filter-options">
        <el-radio-group
          v-model="currentFilter"
          size="small"
          @change="changeFilter"
        >
          <el-radio-button label="latest">最新发布</el-radio-button>
          <el-radio-button label="hot">热门讨论</el-radio-button>
          <el-radio-button label="recommended">推荐内容</el-radio-button>
        </el-radio-group>

        <div class="tag-filter">
          <el-popover placement="bottom" trigger="click" width="300">
            <template #reference>
              <el-button size="small" icon="el-icon-collection-tag">
                话题分类
              </el-button>
            </template>
            <div class="tags-container">
              <el-tag
                v-for="tag in tags"
                :key="tag._id"
                :type="tag.type"
                effect="dark"
                :class="{ active: selectedTags.includes(tag._id) }"
                @click="toggleTag(tag._id)"
                class="clickable-tag"
              >
                {{ tag.name }}
              </el-tag>
            </div>
          </el-popover>
        </div>
      </div>
    </div>

    <!-- 创建新帖子 -->
    <div class="create-post-container">
      <div class="user-avatar">
        <el-avatar
          :src="userStore.userInfo?.avatar || ''"
          icon="el-icon-user-solid"
          :size="40"
        ></el-avatar>
        <div class="anonymous-badge">匿名</div>
      </div>
      <div class="post-input-container">
        <div
          v-if="!isCreatingPost"
          class="create-post-placeholder"
          @click="startCreatePost"
        >
          分享你的心情、困惑或想法...
        </div>
        <div v-else class="post-editor">
          <el-input
            type="textarea"
            v-model="newPost.content"
            placeholder="分享你的心情、困惑或想法..."
            :rows="3"
            resize="none"
          ></el-input>

          <div class="post-options">
            <div class="post-tags">
              <el-select
                v-model="newPost.tags"
                multiple
                collapse-tags
                placeholder="选择话题标签"
                size="small"
              >
                <el-option
                  v-for="tag in tags"
                  :key="tag._id"
                  :label="tag.name"
                  :value="tag._id"
                ></el-option>
              </el-select>
            </div>

            <div class="post-actions">
              <el-checkbox v-model="newPost.anonymous">匿名发布</el-checkbox>
              <el-button size="small" @click="cancelPost">取消</el-button>
              <el-button
                type="primary"
                size="small"
                :disabled="!newPost.content.trim()"
                @click="submitPost"
                >发布</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="posts-container">
      <div
        v-for="post in filteredPosts"
        :key="post._id"
        class="post-card"
        :data-post-id="post._id"
      >
        <div class="post-header">
          <div class="post-author">
            <el-avatar
              :size="36"
              :src="post.author.avatar"
              icon="el-icon-user-solid"
            ></el-avatar>
            <div class="author-info">
              <span class="author-name">{{
                post.anonymous ? "匿名用户" : post.author.username
              }}</span>
              <span class="post-time">{{ formatTimeAgo(post.createdAt) }}</span>
            </div>
          </div>
          <div class="post-menu">
            <el-dropdown trigger="click">
              <i class="el-icon-more"></i>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="el-icon-star-off"
                    >收藏</el-dropdown-item
                  >
                  <el-dropdown-item icon="el-icon-warning-outline"
                    >举报</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <div class="post-content">
          {{ post.content }}
        </div>

        <div class="post-tags" v-if="post.tags && post.tags.length > 0">
          <el-tag
            v-for="tag in post.tags"
            :key="tag._id"
            size="small"
            effect="dark"
            :type="tag.type"
          >
            {{ tag.name }}
          </el-tag>
        </div>

        <div class="post-actions">
          <div
            class="action-btn"
            :class="{ active: post.liked }"
            @click="toggleLike(post)"
          >
            <i class="el-icon-top"></i>
            <span>{{ post.likes }}</span>
          </div>
          <div
            class="action-btn"
            :class="{ active: post.disliked }"
            @click="toggleDislike(post)"
          >
            <i class="el-icon-bottom"></i>
            <span>{{ post.dislikes }}</span>
          </div>
          <div class="action-btn" @click="toggleComments(post)">
            <i class="el-icon-chat-dot-round"></i>
            <span>{{ post.commentCount || 0 }}</span>
          </div>
          <div class="action-btn">
            <i class="el-icon-share"></i>
            <span>分享</span>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section" v-if="post.showComments">
          <!-- 评论列表 -->
          <div
            class="comments-list"
            v-if="post.comments && post.comments.length > 0"
          >
            <div
              v-for="comment in post.comments"
              :key="comment._id"
              class="comment-item"
            >
              <div class="comment-avatar">
                <el-avatar
                  :size="28"
                  :src="comment.author.avatar"
                  icon="el-icon-user-solid"
                ></el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{
                    comment.anonymous ? "匿名用户" : comment.author.username
                  }}</span>
                  <span class="comment-time">{{
                    formatTimeAgo(comment.createdAt)
                  }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <span
                    class="comment-like"
                    @click="likeComment(post._id, comment._id)"
                  >
                    <i
                      class="el-icon-top"
                      :class="{ active: comment.liked }"
                    ></i>
                    <span>{{ comment.likes }}</span>
                  </span>
                  <span
                    class="comment-reply"
                    @click="replyToComment(post._id, comment)"
                    >回复</span
                  >
                </div>

                <!-- 评论回复 -->
                <div
                  class="comment-replies"
                  v-if="comment.replies && comment.replies.length > 0"
                >
                  <div
                    v-for="reply in comment.replies"
                    :key="reply._id"
                    class="reply-item"
                  >
                    <div class="reply-avatar">
                      <el-avatar
                        :size="24"
                        :src="reply.author.avatar"
                        icon="el-icon-user-solid"
                      ></el-avatar>
                    </div>
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-author">{{
                          reply.anonymous ? "匿名用户" : reply.author.username
                        }}</span>
                        <span class="reply-time">{{
                          formatTimeAgo(reply.createdAt)
                        }}</span>
                      </div>
                      <div class="reply-text">
                        <span v-if="reply.replyTo" class="reply-to"
                          >回复 @{{ reply.replyTo.username }}：</span
                        >
                        {{ reply.content }}
                      </div>
                      <div class="reply-actions">
                        <span
                          class="reply-like"
                          @click="likeComment(post._id, reply._id)"
                        >
                          <i
                            class="el-icon-top"
                            :class="{ active: reply.liked }"
                          ></i>
                          <span>{{ reply.likes }}</span>
                        </span>
                        <span
                          class="reply-reply"
                          @click="replyToComment(post._id, reply)"
                          >回复</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="empty-comments" v-else>
            <i class="el-icon-chat-dot-round"></i>
            <span>暂无评论，快来发表第一条评论吧</span>
          </div>

          <!-- 发表评论 -->
          <div class="create-comment">
            <div class="comment-avatar">
              <el-avatar
                :size="28"
                :src="userStore.userInfo?.avatar || ''"
                icon="el-icon-user-solid"
              ></el-avatar>
            </div>
            <div class="comment-input">
              <el-input
                v-model="commentInputs[post._id]"
                placeholder="发表评论..."
                size="small"
                @keyup.enter="submitComment(post._id)"
              >
                <template #append>
                  <el-button
                    icon="el-icon-position"
                    @click="submitComment(post._id)"
                    :disabled="
                      !commentInputs[post._id] ||
                      !commentInputs[post._id].trim()
                    "
                  ></el-button>
                </template>
              </el-input>
              <div class="comment-options">
                <el-checkbox v-model="commentAnonymous[post._id]"
                  >匿名评论</el-checkbox
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中状态 -->
      <div class="loading-state" v-if="loading">
        <el-skeleton :rows="3" animated />
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMorePosts && !loading">
        <el-button type="text" @click="loadMorePosts">加载更多</el-button>
      </div>

      <!-- 无内容提示 -->
      <div class="empty-posts" v-if="filteredPosts.length === 0 && !loading">
        <i class="el-icon-chat-dot-round"></i>
        <p>暂无相关内容</p>
        <el-button type="primary" @click="startCreatePost"
          >发布第一个帖子</el-button
        >
      </div>
    </div>

    <!-- 返回顶部 -->
    <el-backtop target=".forum-container"></el-backtop>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElLoading } from "element-plus";
import dayjs from "dayjs";
import * as forumApi from "@/api/forum";
import { useUserStore } from "@/stores/user";

// 用户信息
const userStore = useUserStore();

// 当前过滤器
const currentFilter = ref("latest");

// 加载状态
const loading = ref(false);

// 标签列表
const tags = ref<Tag[]>([]);

// 选中的标签ID
const selectedTags = ref<string[]>([]);

// 帖子列表数据
const posts = ref<Post[]>([]);

// 分页数据
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

// 新帖子内容
const newPost = reactive({
  content: "",
  tags: [] as string[],
  anonymous: true,
});

// 是否正在创建帖子
const isCreatingPost = ref(false);

// 评论输入
const commentInputs = reactive<Record<string, string>>({});
const commentAnonymous = reactive<Record<string, boolean>>({});

// 是否有更多帖子
const hasMorePosts = computed(() => {
  return pagination.page < pagination.totalPages;
});

// 过滤后的帖子列表（这里不再需要本地过滤，由后端完成）
const filteredPosts = computed(() => {
  return posts.value;
});

// 添加类型定义
interface Tag {
  _id: string;
  name: string;
  type: string;
  description?: string;
  order?: number;
  postCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Author {
  _id: string | null;
  username: string;
  avatar: string;
  status?: string;
}

interface Reply {
  _id: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  anonymous: boolean;
  replyTo?: {
    username: string;
  };
}

interface Comment {
  _id: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  anonymous: boolean;
  replies?: Reply[];
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  createdAt: string;
  tags: Tag[];
  likes: number;
  dislikes: number;
  liked: boolean;
  disliked: boolean;
  anonymous: boolean;
  commentCount: number;
  comments?: Comment[];
  showComments?: boolean;
}

// 格式化时间
const formatTimeAgo = (time: string) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(time).getTime()) / 1000); // 秒

  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return dayjs(time).format("YYYY-MM-DD");
};

// 根据ID获取标签
const getTagById = (id: string) => {
  return (
    tags.value.find((tag) => tag._id === id) || {
      _id: "",
      name: "",
      type: "info",
    }
  );
};

// 加载标签
const loadTags = async () => {
  try {
    const res = await forumApi.getAllTags();
    if (res.success) {
      tags.value = res.data;
    }
  } catch (error) {
    console.error("加载标签失败:", error);
    ElMessage.error("获取标签失败，请刷新重试");
  }
};

// 加载帖子
const loadPosts = async (resetPage = false) => {
  if (loading.value) return;

  if (resetPage) {
    pagination.page = 1;
  }

  loading.value = true;
  const loadingInstance = ElLoading.service({
    target: ".posts-container",
    text: "加载中...",
    background: "rgba(0, 0, 0, 0.5)",
  });

  try {
    const res = await forumApi.getPosts({
      page: pagination.page,
      limit: pagination.limit,
      filter: currentFilter.value as "latest" | "hot" | "recommended",
      tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
    });

    if (res.success) {
      // 如果是第一页，则替换数据；否则追加数据
      if (pagination.page === 1) {
        posts.value = res.data;
      } else {
        posts.value = [...posts.value, ...res.data];
      }

      pagination.total = res.total;
      pagination.totalPages = res.totalPages;
    } else {
      ElMessage.error(res.message || "获取帖子失败");
    }
  } catch (error) {
    console.error("加载帖子失败:", error);
    ElMessage.error("获取帖子列表失败，请刷新重试");
  } finally {
    loading.value = false;
    loadingInstance.close();
  }
};

// 切换标签选择
const toggleTag = (tagId: string) => {
  const index = selectedTags.value.indexOf(tagId);
  if (index === -1) {
    selectedTags.value.push(tagId);
  } else {
    selectedTags.value.splice(index, 1);
  }

  // 重新加载帖子
  loadPosts(true);
};

// 切换过滤器
const changeFilter = (filter: string) => {
  currentFilter.value = filter;
  // 重新加载帖子
  loadPosts(true);
};

// 开始创建帖子
const startCreatePost = () => {
  isCreatingPost.value = true;
};

// 取消创建帖子
const cancelPost = () => {
  isCreatingPost.value = false;
  newPost.content = "";
  newPost.tags = [];
};

// 提交帖子
const submitPost = async () => {
  if (!newPost.content.trim()) {
    ElMessage.warning("内容不能为空");
    return;
  }

  try {
    const res = await forumApi.createPost({
      content: newPost.content,
      tags: newPost.tags,
      anonymous: newPost.anonymous,
    });

    if (res.success) {
      ElMessage.success("发布成功");

      // 将新帖子添加到列表头部
      posts.value.unshift(res.data);

      // 重置表单
      cancelPost();

      // 重新加载第一页帖子
      loadPosts(true);
    } else {
      ElMessage.error(res.message || "发布失败");
    }
  } catch (error) {
    console.error("发布帖子失败:", error);
    ElMessage.error("发布帖子失败，请重试");
  }
};

// 切换评论显示
const toggleComments = async (post: Post) => {
  // 切换显示状态
  post.showComments = !post.showComments;

  // 如果是显示评论，并且还没有加载过评论，则加载评论
  if (post.showComments && !post.comments) {
    try {
      const res = await forumApi.getPostComments(post._id);

      if (res.success) {
        post.comments = res.data;
      } else {
        ElMessage.error(res.message || "获取评论失败");
      }
    } catch (error) {
      console.error("加载评论失败:", error);
      ElMessage.error("获取评论失败，请重试");
    }
  }

  // 初始化评论输入
  if (post.showComments && !commentInputs[post._id]) {
    commentInputs[post._id] = "";
    commentAnonymous[post._id] = true;
  }
};

// 点赞帖子
const toggleLike = async (post: Post) => {
  try {
    const res = await forumApi.likePost(post._id);

    if (res.success) {
      // 更新帖子的点赞状态和数量
      post.liked = res.data.liked;
      post.disliked = res.data.disliked;
      post.likes = res.data.likes;
      post.dislikes = res.data.dislikes;

      ElMessage.success(res.message);
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("点赞失败:", error);
    ElMessage.error("操作失败，请重试");
  }
};

// 踩帖子
const toggleDislike = async (post: Post) => {
  try {
    const res = await forumApi.dislikePost(post._id);

    if (res.success) {
      // 更新帖子的点赞状态和数量
      post.liked = res.data.liked;
      post.disliked = res.data.disliked;
      post.likes = res.data.likes;
      post.dislikes = res.data.dislikes;

      ElMessage.success(res.message);
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("点踩失败:", error);
    ElMessage.error("操作失败，请重试");
  }
};

// 回复评论
const replyToComment = (postId: string, comment: Comment | Reply) => {
  // 设置评论内容为回复格式
  commentInputs[postId] = `回复 @${
    comment.anonymous ? "匿名用户" : comment.author.username
  }：`;

  // 聚焦到评论输入框
  setTimeout(() => {
    const inputEl = document.querySelector(
      `.post-card[data-post-id="${postId}"] .comment-input input`
    ) as HTMLElement;
    if (inputEl) {
      inputEl.focus();
    }
  }, 0);
};

// 点赞评论
const likeComment = async (postId: string, commentId: string) => {
  try {
    const res = await forumApi.likeComment(commentId);

    if (res.success) {
      // 找到对应的评论并更新状态
      const post = posts.value.find((p) => p._id === postId);
      if (post && post.comments) {
        // 查找是否是顶层评论
        let comment = post.comments.find((c) => c._id === commentId);

        if (comment) {
          comment.liked = res.data.liked;
          comment.likes = res.data.likes;
        } else {
          // 可能是评论回复
          for (const topComment of post.comments) {
            if (topComment.replies) {
              const reply = topComment.replies.find((r) => r._id === commentId);
              if (reply) {
                reply.liked = res.data.liked;
                reply.likes = res.data.likes;
                break;
              }
            }
          }
        }
      }

      ElMessage.success(res.message);
    } else {
      ElMessage.error(res.message || "操作失败");
    }
  } catch (error) {
    console.error("点赞评论失败:", error);
    ElMessage.error("操作失败，请重试");
  }
};

// 提交评论
const submitComment = async (postId: string) => {
  const content = commentInputs[postId];
  if (!content || !content.trim()) {
    ElMessage.warning("评论内容不能为空");
    return;
  }

  try {
    const res = await forumApi.createComment(postId, {
      content,
      anonymous: commentAnonymous[postId],
    });

    if (res.success) {
      // 找到帖子并添加评论
      const post = posts.value.find((p) => p._id === postId);
      if (post) {
        if (!post.comments) {
          post.comments = [];
        }

        post.comments.unshift(res.data);
        post.commentCount = (post.commentCount || 0) + 1;
      }

      // 清空输入
      commentInputs[postId] = "";

      ElMessage.success("评论成功");
    } else {
      ElMessage.error(res.message || "评论失败");
    }
  } catch (error) {
    console.error("提交评论失败:", error);
    ElMessage.error("评论失败，请重试");
  }
};

// 加载更多帖子
const loadMorePosts = () => {
  if (!hasMorePosts.value) return;

  pagination.page++;
  loadPosts();
};

// 组件挂载时加载数据
onMounted(async () => {
  // 先加载标签
  await loadTags();

  // 再加载帖子
  loadPosts(true);
});
</script>

<style lang="scss" scoped>
.forum-container {
  background-color: #36393f;
  color: #dcddde;
  min-height: 100vh;
  padding: 20px;
  overflow-y: auto;
  margin: 0 auto;
}

.forum-header {
  margin-bottom: 24px;

  .forum-title {
    display: flex;
    align-items: center;

    i {
      font-size: 24px;
      margin-right: 12px;
      color: #5865f2;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: white;
    }
  }

  .header-desc {
    color: #b9bbbe;
    margin: 8px 0 20px;
    font-size: 14px;
  }

  .filter-options {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tag-filter {
      margin-left: 10px;
    }
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .clickable-tag {
    cursor: pointer;

    &.active {
      border: 1px solid white;
    }
  }
}

.create-post-container {
  background-color: #2f3136;
  border-radius: 5px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;

  .user-avatar {
    position: relative;
    margin-right: 16px;

    .anonymous-badge {
      position: absolute;
      bottom: -5px;
      right: -5px;
      background-color: #5865f2;
      color: white;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 10px;
    }
  }

  .post-input-container {
    flex: 1;

    .create-post-placeholder {
      background-color: #40444b;
      border-radius: 4px;
      padding: 10px 16px;
      color: #72767d;
      cursor: pointer;
      min-height: 42px;
      display: flex;
      align-items: center;

      &:hover {
        background-color: #4f545c;
      }
    }

    .post-editor {
      :deep(.el-textarea__inner) {
        background-color: #40444b;
        border: none;
        color: white;

        &::placeholder {
          color: #72767d;
        }

        &:focus {
          box-shadow: none;
        }
      }

      .post-options {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        align-items: center;

        .post-tags {
          width: 50%;

          :deep(.el-select) {
            width: 100%;
          }
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
      }
    }
  }
}

.posts-container {
  .loading-state {
    background-color: #2f3136;
    border-radius: 5px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .post-card {
    background-color: #2f3136;
    border-radius: 5px;
    padding: 16px;
    margin-bottom: 16px;

    .post-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;

      .post-author {
        display: flex;
        align-items: center;

        .author-info {
          margin-left: 12px;

          .author-name {
            display: block;
            color: white;
            font-weight: 500;
          }

          .post-time {
            color: #b9bbbe;
            font-size: 12px;
          }
        }
      }

      .post-menu {
        cursor: pointer;
        color: #b9bbbe;

        i {
          font-size: 20px;

          &:hover {
            color: white;
          }
        }
      }
    }

    .post-content {
      margin-bottom: 16px;
      color: white;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .post-tags {
      margin-bottom: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .post-actions {
      display: flex;
      border-top: 1px solid #40444b;
      border-bottom: 1px solid #40444b;
      padding: 10px 0;
      margin-bottom: 16px;

      .action-btn {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #b9bbbe;
        margin-right: 24px;

        i {
          margin-right: 6px;
          font-size: 16px;
        }

        &:hover,
        &.active {
          color: #5865f2;
        }
      }
    }

    .comments-section {
      .comments-list {
        margin-bottom: 16px;

        .comment-item {
          display: flex;
          margin-bottom: 16px;

          &:last-child {
            margin-bottom: 0;
          }

          .comment-avatar {
            margin-right: 12px;
          }

          .comment-content {
            flex: 1;

            .comment-header {
              margin-bottom: 6px;

              .comment-author {
                font-weight: 500;
                color: white;
                margin-right: 8px;
              }

              .comment-time {
                color: #b9bbbe;
                font-size: 12px;
              }
            }

            .comment-text {
              line-height: 1.4;
              margin-bottom: 6px;
            }

            .comment-actions {
              display: flex;
              align-items: center;

              .comment-like,
              .comment-reply {
                display: flex;
                align-items: center;
                cursor: pointer;
                color: #b9bbbe;
                font-size: 12px;
                margin-right: 16px;

                i {
                  margin-right: 4px;

                  &.active {
                    color: #5865f2;
                  }
                }

                &:hover {
                  color: white;
                }
              }
            }

            .comment-replies {
              margin-top: 10px;
              margin-left: 20px;

              .reply-item {
                display: flex;
                margin-bottom: 10px;

                .reply-avatar {
                  margin-right: 8px;
                }

                .reply-content {
                  flex: 1;

                  .reply-header {
                    margin-bottom: 4px;

                    .reply-author {
                      font-weight: 500;
                      color: white;
                      margin-right: 8px;
                      font-size: 12px;
                    }

                    .reply-time {
                      color: #b9bbbe;
                      font-size: 11px;
                    }
                  }

                  .reply-text {
                    line-height: 1.4;
                    font-size: 13px;
                    margin-bottom: 4px;

                    .reply-to {
                      color: #5865f2;
                    }
                  }

                  .reply-actions {
                    display: flex;
                    align-items: center;

                    .reply-like,
                    .reply-reply {
                      display: flex;
                      align-items: center;
                      cursor: pointer;
                      color: #b9bbbe;
                      font-size: 11px;
                      margin-right: 12px;

                      i {
                        margin-right: 3px;
                        font-size: 11px;

                        &.active {
                          color: #5865f2;
                        }
                      }

                      &:hover {
                        color: white;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      .empty-comments {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        color: #72767d;

        i {
          font-size: 24px;
          margin-bottom: 8px;
        }
      }

      .create-comment {
        display: flex;
        margin-top: 16px;

        .comment-avatar {
          margin-right: 12px;
        }

        .comment-input {
          flex: 1;

          :deep(.el-input__inner) {
            background-color: #40444b;
            border: none;
            color: white;

            &::placeholder {
              color: #72767d;
            }
          }

          .comment-options {
            margin-top: 8px;
            display: flex;
            justify-content: flex-end;

            :deep(.el-checkbox__label) {
              font-size: 12px;
              color: #b9bbbe;
            }
          }
        }
      }
    }
  }

  .load-more {
    text-align: center;
    margin: 20px 0;

    :deep(.el-button) {
      color: #5865f2;
    }
  }

  .empty-posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;

    i {
      font-size: 48px;
      color: #72767d;
      margin-bottom: 20px;
    }

    p {
      color: #b9bbbe;
      margin-bottom: 20px;
    }
  }
}

:deep(.el-button--primary) {
  background-color: #5865f2;
  border-color: #5865f2;

  &:hover,
  &:focus {
    background-color: #4752c4;
    border-color: #4752c4;
  }
}

:deep(.el-radio-button__inner) {
  background-color: #2f3136;
  color: #b9bbbe;
  border-color: #4f545c;

  &:hover {
    color: white;
  }
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #5865f2;
  border-color: #5865f2;
  box-shadow: -1px 0 0 0 #5865f2;
  color: white;
}
</style>
