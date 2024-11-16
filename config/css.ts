// import postCssPurge from '@fullhuman/postcss-purgecss';
import type { CSSOptions } from "vite";
// const vuePath = /\.vue(\?.+)?$/;
// const resetFileReg = /style\/reset/;
export function useCss(mode?: string): Partial<CSSOptions> {
  // const isProd = mode === 'production';
  return {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '@/assets/style/vars.scss' as *;`, // 添加公共样式
      },
    },
    postcss: {
      plugins: [
        // {
        //   postcssPlugin: 'internal:charset-removal',
        //   AtRule: {
        //     charset: (atRule) => {
        //       if (atRule.name === 'charset') {
        //         atRule.remove();
        //       }
        //     },
        //   },
        // },
        /**
         * 这是针对css的shaking 使用的是pruge 可以作为一个优化手段
         * 但正式项目不建议使用
         * 1 开发环境会导致unused-class提示丢失
         * 2 只在生产时使用有环境展现不一致的风险
         *
         */
        // isProd
        //   ? postCssPurge({
        //       contentFunction: (sourceInputFile) => {
        //         // console.log(1, sourceInputFile);
        //         // console.log(2, vuePath.test(sourceInputFile));
        //         // console.log(3, sourceInputFile.replace(vuePath, '.vue'));
        //         if (vuePath.test(sourceInputFile)) {
        //           return [sourceInputFile.replace(vuePath, '.vue')];
        //         }
        //         if (resetFileReg.test(sourceInputFile)) {
        //           return [sourceInputFile];
        //         }
        //         return ['src/**/*.vue', 'index.html'];
        //       },
        //       defaultExtractor(content) {
        //         // console.log(4, content);
        //         if (content.startsWith('<template')) {
        //           content = content.split('</template')[0] + '</template>';
        //         }
        //         return content.match(/[\w-/:]+(?<!:)/g) || [];
        //       },
        //       safelist: {
        //         greedy: [/^el-/],
        //       },
        //       skippedContentGlobs: ['node_modules/**'],
        //     })
        //   : () => {},
      ],
    },
  };
}
