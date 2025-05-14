<!-- App.vue -->
<template>
  <div id="app" class="bg-theme-main text-theme-normal">
    <el-config-provider :theme="elementTheme">
      <router-view />
    </el-config-provider>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, computed } from "vue";
import { useThemeStore } from "@/stores/theme";

export default defineComponent({
  name: "App",
  setup() {
    const themeStore = useThemeStore();

    // Create a computed property for Element Plus theme
    const elementTheme = computed(() => {
      // For light theme, use Element's default light theme
      // For other themes, use Element's dark theme as a base and customize with CSS
      return themeStore.currentTheme === "light" ? "light" : "dark";
    });

    // Initialize theme
    onMounted(() => {
      // Theme is already initialized in setupStores in main.ts
      // This just ensures the current theme is applied to the document
      document.documentElement.setAttribute(
        "data-theme",
        themeStore.currentTheme
      );
      document.documentElement.classList.add(
        `theme-${themeStore.currentTheme}`
      );
    });

    // Watch for theme changes
    watch(
      () => themeStore.currentTheme,
      (newTheme, oldTheme) => {
        // Apply theme attribute
        document.documentElement.setAttribute("data-theme", newTheme);

        // Update CSS classes
        if (oldTheme) {
          document.documentElement.classList.remove(`theme-${oldTheme}`);
        }
        document.documentElement.classList.add(`theme-${newTheme}`);
      }
    );

    return {
      themeStore,
      elementTheme,
    };
  },
});
</script>

<style>
#app {
  min-height: 100vh;
  transition: background-color var(--theme-transition-duration) ease,
    color var(--theme-transition-duration) ease;
}

/* Apply theme transitions globally */
* {
  transition: background-color var(--theme-transition-duration) ease,
    color var(--theme-transition-duration) ease,
    border-color var(--theme-transition-duration) ease;
}
</style>
