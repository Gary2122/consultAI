// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import UnoCSS from "unocss/vite";
import path from "path";
// import { useCss } from "./config/css";
// const pathResolve = (pathStr: string) => {
//   return path.resolve(__dirname, pathStr);
// };
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
      imports: ["vue"], // 自动引入 Vue API，如 ref, reactive, watch 等
      resolvers: [ElementPlusResolver()],
      dts: "src/auto-imports.d.ts", // 可选：生成自动引入的类型声明文件
    }),
    Components({
      dirs: ["src/components"], // 指定组件目录，可以是多个路径
      resolvers: [ElementPlusResolver()],
      extensions: ["vue"], // 组件的文件扩展名
      deep: true, // 是否递归搜索子目录
      dts: "src/components.d.ts", // 可选：生成自动导入的类型声明文件
    }),
  ],
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
