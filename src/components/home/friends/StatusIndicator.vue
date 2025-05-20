<template>
  <div class="status-indicator" :class="statusClass" :title="statusTitle"></div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  status?: string;
  size?: "small" | "medium" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  status: "offline",
  size: "medium",
});

// 根据状态计算CSS类
const statusClass = computed(() => {
  return {
    [props.status]: true,
    [props.size]: true,
  };
});

// 状态提示文本
const statusTitle = computed(() => {
  const statusMap: Record<string, string> = {
    online: "在线",
    away: "离开",
    busy: "勿扰",
    offline: "离线",
  };
  return statusMap[props.status] || "离线";
});
</script>

<style lang="scss" scoped>
.status-indicator {
  position: relative;
  display: inline-block;
  border-radius: 50%;

  // 小尺寸
  &.small {
    width: 8px;
    height: 8px;

    &.offline:after {
      width: 4px;
      height: 4px;
      top: 2px;
      left: 2px;
    }
  }

  // 中等尺寸
  &.medium {
    width: 12px;
    height: 12px;

    &.offline:after {
      width: 6px;
      height: 6px;
      top: 3px;
      left: 3px;
    }
  }

  // 大尺寸
  &.large {
    width: 16px;
    height: 16px;

    &.offline:after {
      width: 8px;
      height: 8px;
      top: 4px;
      left: 4px;
    }
  }

  // 在线
  &.online {
    background-color: #3ba55d; // 绿色
  }

  // 离开
  &.away {
    background-color: #faa81a; // 黄色
  }

  // 勿扰
  &.busy {
    background-color: #ed4245; // 红色
  }

  // 离线
  &.offline {
    background-color: #747f8d; // 灰色
    position: relative;

    &:after {
      content: "";
      position: absolute;
      background-color: var(--color-bg-main, #36393f);
      border-radius: 50%;
    }
  }
}
</style>
