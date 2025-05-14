/*
 * @Descripttion: Theme store for managing application theme
 * @version:
 * @Author: Garrison
 * @Date: 2025-05-13 14:26:22
 * @LastEditors: sueRimn
 * @LastEditTime: 2025-05-13 16:00:23
 */
import { defineStore } from "pinia";
import { ref } from "vue";

export type ThemeType = "dark" | "light" | "purple" | "ocean";

type ThemeInfo = {
  value: ThemeType;
  label: string;
  color: string;
  sidebarColor: string;
};

// 主题列表
export const themeList: ThemeInfo[] = [
  {
    label: "深色主题",
    value: "dark",
    color: "#36393f",
    sidebarColor: "#202225",
  },
  {
    label: "浅色主题",
    value: "light",
    color: "#ffffff",
    sidebarColor: "#f2f3f5",
  },
  {
    label: "紫色主题",
    value: "purple",
    color: "#42275a",
    sidebarColor: "#2e1437",
  },
  {
    label: "海洋主题",
    value: "ocean",
    color: "#1a535c",
    sidebarColor: "#0b7a75",
  },
];

export const useThemeStore = defineStore("theme", () => {
  // 当前主题
  const currentTheme = ref<ThemeType>("dark");

  // 初始化主题
  const initTheme = () => {
    console.log("Initializing theme...");
    const savedTheme = localStorage.getItem("app-theme");

    // Set default theme or use saved theme
    const themeToApply =
      savedTheme && isValidTheme(savedTheme)
        ? (savedTheme as ThemeType)
        : "dark";

    console.log(`Applying theme: ${themeToApply}`);
    setTheme(themeToApply);

    // Ensure theme is applied to the document by adding relevant classes
    applyThemeToDocument(themeToApply);
  };

  // 验证主题是否有效
  const isValidTheme = (theme: string): theme is ThemeType => {
    return themeList.some((t) => t.value === theme);
  };

  // 设置主题
  const setTheme = (theme: ThemeType) => {
    console.log(`Setting theme to: ${theme}`);
    currentTheme.value = theme;

    // 保存主题到本地存储
    localStorage.setItem("app-theme", theme);

    // 应用主题到文档
    applyThemeToDocument(theme);
  };

  // 获取主题信息
  const getThemeInfo = () => {
    return (
      themeList.find((t) => t.value === currentTheme.value) || themeList[0]
    );
  };

  // Apply theme to document
  const applyThemeToDocument = (theme: ThemeType) => {
    // Set data-theme attribute
    document.documentElement.setAttribute("data-theme", theme);

    // Clean up all theme classes
    themeList.forEach((t) => {
      document.documentElement.classList.remove(`theme-${t.value}`);
    });

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Also add a body class for components that might need it
    document.body.className = `theme-${theme}-body`;
  };

  return {
    currentTheme,
    initTheme,
    setTheme,
    getThemeInfo,
    themeList,
  };
});
