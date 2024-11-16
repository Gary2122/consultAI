// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import path from "path";
// import { useCss } from "./config/css";
// const pathResolve = (pathStr: string) => {
//   return path.resolve(__dirname, pathStr);
// };
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@use '@/assets/style/vars.scss' as *;`,
        api: "modern-compiler",
      },
    },
  },
});
