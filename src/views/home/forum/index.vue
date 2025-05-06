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
        <el-radio-group v-model="currentFilter" size="small">
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
                :key="tag.id"
                :type="tag.type"
                effect="dark"
                :class="{ active: selectedTags.includes(tag.id) }"
                @click="toggleTag(tag.id)"
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
        <el-avatar icon="el-icon-user-solid" :size="40"></el-avatar>
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
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
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
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-author">
            <el-avatar :size="36" icon="el-icon-user-solid"></el-avatar>
            <div class="author-info">
              <span class="author-name">{{
                post.anonymous ? "匿名用户" : post.author
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
            v-for="tagId in post.tags"
            :key="tagId"
            size="small"
            effect="dark"
            :type="getTagById(tagId).type"
          >
            {{ getTagById(tagId).name }}
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
            <span>{{ post.comments.length }}</span>
          </div>
          <div class="action-btn">
            <i class="el-icon-share"></i>
            <span>分享</span>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section" v-if="post.showComments">
          <!-- 评论列表 -->
          <div class="comments-list" v-if="post.comments.length > 0">
            <div
              v-for="comment in post.comments"
              :key="comment.id"
              class="comment-item"
            >
              <div class="comment-avatar">
                <el-avatar :size="28" icon="el-icon-user-solid"></el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{
                    comment.anonymous ? "匿名用户" : comment.author
                  }}</span>
                  <span class="comment-time">{{
                    formatTimeAgo(comment.createdAt)
                  }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <span
                    class="comment-like"
                    @click="likeComment(post.id, comment.id)"
                  >
                    <i
                      class="el-icon-top"
                      :class="{ active: comment.liked }"
                    ></i>
                    <span>{{ comment.likes }}</span>
                  </span>
                  <span
                    class="comment-reply"
                    @click="replyToComment(post.id, comment.id)"
                    >回复</span
                  >
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
              <el-avatar :size="28" icon="el-icon-user-solid"></el-avatar>
            </div>
            <div class="comment-input">
              <el-input
                v-model="commentInputs[post.id]"
                placeholder="发表评论..."
                size="small"
                @keyup.enter="submitComment(post.id)"
              >
                <template #append>
                  <el-button
                    icon="el-icon-position"
                    @click="submitComment(post.id)"
                    :disabled="
                      !commentInputs[post.id] || !commentInputs[post.id].trim()
                    "
                  ></el-button>
                </template>
              </el-input>
              <div class="comment-options">
                <el-checkbox v-model="commentAnonymous[post.id]"
                  >匿名评论</el-checkbox
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMorePosts">
        <el-button type="text" @click="loadMorePosts">加载更多</el-button>
      </div>

      <!-- 无内容提示 -->
      <div class="empty-posts" v-if="filteredPosts.length === 0">
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
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";

// 当前过滤器
const currentFilter = ref("latest");

// 话题标签
const tags = [
  { id: 1, name: "学习压力", type: "primary" },
  { id: 2, name: "人际关系", type: "success" },
  { id: 3, name: "情绪管理", type: "warning" },
  { id: 4, name: "职场困惑", type: "danger" },
  { id: 5, name: "恋爱问题", type: "info" },
  { id: 6, name: "家庭矛盾", type: "primary" },
  { id: 7, name: "自我提升", type: "success" },
  { id: 8, name: "睡眠问题", type: "warning" },
  { id: 9, name: "考试焦虑", type: "danger" },
  { id: 10, name: "社交恐惧", type: "info" },
];

// 选中的标签ID
const selectedTags = ref<number[]>([]);

// 帖子列表数据
const posts = ref([
  {
    id: 1,
    author: "用户001",
    anonymous: true,
    content: "最近考试压力很大，总是睡不好觉，有什么好的缓解方法吗？",
    createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    likes: 24,
    dislikes: 2,
    liked: false,
    disliked: false,
    tags: [1, 8, 9],
    showComments: false,
    comments: [
      {
        id: 1,
        author: "用户002",
        anonymous: false,
        content: "试试冥想和深呼吸，对我很有效！",
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        likes: 5,
        liked: false,
      },
      {
        id: 2,
        author: "用户003",
        anonymous: true,
        content: "每晚泡脚，喝杯热牛奶，我之前也是这样，坚持下来就好多了",
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        likes: 3,
        liked: false,
      },
    ],
  },
  {
    id: 2,
    author: "用户004",
    anonymous: false,
    content:
      "和室友关系很差，但是不得不一起住，怎么改善关系或者至少和平共处？求解！",
    createdAt: new Date(Date.now() - 12 * 3600 * 1000),
    likes: 18,
    dislikes: 0,
    liked: false,
    disliked: false,
    tags: [2, 6],
    showComments: false,
    comments: [
      {
        id: 1,
        author: "用户005",
        anonymous: true,
        content:
          "尝试找个合适的时机坐下来好好沟通一次，说出自己的感受和期望，不指责对方",
        createdAt: new Date(Date.now() - 8 * 3600 * 1000),
        likes: 7,
        liked: false,
      },
    ],
  },
  {
    id: 3,
    author: "用户006",
    anonymous: true,
    content:
      "工作第一年，感觉压力很大，每天都担心做不好被辞退。前辈们有什么建议吗？",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    likes: 45,
    dislikes: 3,
    liked: false,
    disliked: false,
    tags: [4, 3, 7],
    showComments: false,
    comments: [
      {
        id: 1,
        author: "用户007",
        anonymous: false,
        content:
          "正常的！我第一年也这样，多问问题，勇于承认错误，积极学习，慢慢就会好起来的",
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        likes: 12,
        liked: false,
      },
      {
        id: 2,
        author: "用户008",
        anonymous: true,
        content:
          "建议下班后做点自己喜欢的事情放松一下，不要把全部精力都放在工作上",
        createdAt: new Date(Date.now() - 18 * 3600 * 1000),
        likes: 8,
        liked: false,
      },
      {
        id: 3,
        author: "用户009",
        anonymous: false,
        content: "可以找一个职场导师，有针对性地提升自己，会更有方向感",
        createdAt: new Date(Date.now() - 6 * 3600 * 1000),
        likes: 5,
        liked: false,
      },
    ],
  },
]);

// 新帖子内容
const newPost = reactive({
  content: "",
  tags: [],
  anonymous: true,
});

// 是否正在创建帖子
const isCreatingPost = ref(false);

// 评论输入
const commentInputs = reactive<Record<number, string>>({});
const commentAnonymous = reactive<Record<number, boolean>>({});

// 是否有更多帖子
const hasMorePosts = ref(true);

// 根据过滤条件筛选帖子
const filteredPosts = computed(() => {
  let result = [...posts.value];

  // 根据标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter((post) =>
      post.tags.some((tagId) => selectedTags.value.includes(tagId))
    );
  }

  // 根据过滤器排序
  switch (currentFilter.value) {
    case "latest":
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "hot":
      result.sort((a, b) => b.likes - b.dislikes - (a.likes - a.dislikes));
      break;
    case "recommended":
      // 这里可以实现更复杂的推荐算法，暂时简单实现
      result.sort(
        (a, b) =>
          b.likes * 2 + b.comments.length - (a.likes * 2 + a.comments.length)
      );
      break;
  }

  return result;
});

// 格式化时间
const formatTimeAgo = (time: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000); // 秒

  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  return dayjs(time).format("YYYY-MM-DD");
};

// 根据ID获取标签
const getTagById = (id: number) => {
  return tags.find((tag) => tag.id === id) || { id: 0, name: "", type: "info" };
};

// 切换标签选择
const toggleTag = (tagId: number) => {
  const index = selectedTags.value.indexOf(tagId);
  if (index === -1) {
    selectedTags.value.push(tagId);
  } else {
    selectedTags.value.splice(index, 1);
  }
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
const submitPost = () => {
  if (!newPost.content.trim()) {
    ElMessage.warning("内容不能为空");
    return;
  }

  // 模拟提交帖子
  const newPostObj = {
    id: Math.max(...posts.value.map((p) => p.id)) + 1,
    author: "当前用户",
    anonymous: newPost.anonymous,
    content: newPost.content,
    createdAt: new Date(),
    likes: 0,
    dislikes: 0,
    liked: false,
    disliked: false,
    tags: newPost.tags,
    showComments: false,
    comments: [],
  };

  posts.value.unshift(newPostObj);
  ElMessage.success("发布成功");

  // 重置表单
  cancelPost();
};

// 切换评论显示
const toggleComments = (post: any) => {
  post.showComments = !post.showComments;

  // 初始化评论输入
  if (post.showComments && !commentInputs[post.id]) {
    commentInputs[post.id] = "";
    commentAnonymous[post.id] = true;
  }
};

// 点赞帖子
const toggleLike = (post: any) => {
  if (post.liked) {
    post.likes--;
    post.liked = false;
  } else {
    if (post.disliked) {
      post.dislikes--;
      post.disliked = false;
    }
    post.likes++;
    post.liked = true;
  }
};

// 踩帖子
const toggleDislike = (post: any) => {
  if (post.disliked) {
    post.dislikes--;
    post.disliked = false;
  } else {
    if (post.liked) {
      post.likes--;
      post.liked = false;
    }
    post.dislikes++;
    post.disliked = true;
  }
};

// 回复评论
const replyToComment = (postId: number, commentId: number) => {
  const post = posts.value.find((p) => p.id === postId);
  if (!post) return;

  const comment = post.comments.find((c) => c.id === commentId);
  if (!comment) return;

  // 设置评论内容为回复格式
  commentInputs[postId] = `回复 @${
    comment.anonymous ? "匿名用户" : comment.author
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
const likeComment = (postId: number, commentId: number) => {
  const post = posts.value.find((p) => p.id === postId);
  if (!post) return;

  const comment = post.comments.find((c) => c.id === commentId);
  if (!comment) return;

  if (comment.liked) {
    comment.likes--;
    comment.liked = false;
  } else {
    comment.likes++;
    comment.liked = true;
  }
};

// 提交评论
const submitComment = (postId: number) => {
  const content = commentInputs[postId];
  if (!content || !content.trim()) {
    ElMessage.warning("评论内容不能为空");
    return;
  }

  const post = posts.value.find((p) => p.id === postId);
  if (!post) return;

  // 添加新评论
  post.comments.push({
    id: Math.max(...post.comments.map((c) => c.id), 0) + 1,
    author: "当前用户",
    anonymous: commentAnonymous[postId],
    content: content,
    createdAt: new Date(),
    likes: 0,
    liked: false,
  });

  // 清空输入
  commentInputs[postId] = "";

  ElMessage.success("评论成功");
};

// 加载更多帖子
const loadMorePosts = () => {
  // 模拟加载更多，实际应调用API
  setTimeout(() => {
    // 假设没有更多帖子了
    hasMorePosts.value = false;
    ElMessage.info("已加载全部内容");
  }, 1000);
};
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
