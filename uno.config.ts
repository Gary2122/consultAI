// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import presetRemToPx from "@unocss/preset-rem-to-px";
import presetTheme from "unocss-preset-theme";

const themeColors = {
  // Dark theme (default)
  dark: {
    primary: "#5865f2",
    "primary-light": "#7289da",
    "bg-main": "#36393f",
    "bg-secondary": "#2f3136",
    "bg-tertiary": "#202225",
    "text-normal": "#dcddde",
    "text-muted": "#b9bbbe",
    "text-link": "#00aff4",
    header: "#202225",
    accent: "#5865f2",
  },
  // Light theme
  light: {
    primary: "#5865f2",
    "primary-light": "#7289da",
    "bg-main": "#ffffff",
    "bg-secondary": "#f2f3f5",
    "bg-tertiary": "#e3e5e8",
    "text-normal": "#2e3338",
    "text-muted": "#747f8d",
    "text-link": "#0068e0",
    header: "#f2f3f5",
    accent: "#5865f2",
  },
  // Purple theme
  purple: {
    primary: "#9b59b6",
    "primary-light": "#a77bc7",
    "bg-main": "#42275a",
    "bg-secondary": "#372152",
    "bg-tertiary": "#2e1437",
    "text-normal": "#f5f5f5",
    "text-muted": "#c5b8d7",
    "text-link": "#b392d0",
    header: "#2e1437",
    accent: "#9b59b6",
  },
  // Ocean theme
  ocean: {
    primary: "#3498db",
    "primary-light": "#5dade2",
    "bg-main": "#1a535c",
    "bg-secondary": "#115954",
    "bg-tertiary": "#0b7a75",
    "text-normal": "#f5f5f5",
    "text-muted": "#a7d2cb",
    "text-link": "#4fbdba",
    header: "#0b7a75",
    accent: "#3498db",
  },
};

const customTheme: Record<string, any> = {
  colors: {
    cBlack: "#000",
    cWhite: "#fff",
    cPrimary: "#443ef7",
    cPrimaryH: "#2525cf",
    cPrimaryL: "#6060ff",
    cPrimaryL2: "#ebefff",
    cSuccess: "#28ce8e",
    cSuccessH: "#28ce8e",
    cSuccessL: "#c9f3e3",
    cSuccessL2: "#e4fcf3",
    cWarning: "#fb942d",
    cWarningH: "#fb942d",
    cWarningL: "#fb942d",
    cWarningL2: "#fb942d",
    cDanger: "#ff5233",
    cDangerH: "#d94026",
    cDangerL: "#ffdcd6",
    cDangerL2: "#ffeae6",
    cText: "#090e29",
    cTextL: "#5b6799",
    cTextL2: "#a0a9c5",
    cTextL3: "#d8dff0",
    cTextL4: "#ebefff",
    cTextL5: "#f5f7fc",
  },
};

// @ts-ignore
export default defineConfig({
  theme: {
    ...customTheme,
    colors: {
      ...customTheme.colors,
      ...themeColors.dark, // Default theme colors
    },
  },
  rules: [
    [
      /^(\w{0,1})flex-(\w{1})(\w{1})(\w{0,2})$/,
      ([, i, j, a, lw], { theme }) => {
        const flexMap: Record<string, any> = {
          jc: {
            s: "flex-start",
            e: "flex-end",
            c: "center",
            a: "space-around",
            b: "space-between",
          },
          ai: {
            s: "flex-start",
            e: "flex-end",
            c: "center",
            t: "stretch",
          },
        };
        const obj: Record<string, string> = {};
        if (lw === "l") {
          obj["flex-direction"] = "column";
        }
        if (lw === "w") {
          obj["flex-wrap"] = "wrap";
        }
        if (lw === "lw" || lw === "wl") {
          obj["flex-wrap"] = "wrap";
          obj["flex-direction"] = "column";
        }
        if (flexMap.jc[j] && flexMap.ai[a]) console.log();
        return {
          display: i === "i" ? "inline-flex" : "flex",
          "justify-content": flexMap.jc[j],
          "align-items": flexMap.ai[a],
          ...obj,
        };
      },
    ],
    [
      /^ft-(\w+)$/,
      ([, c], { theme }) => {
        if (customTheme.colors[c]) return { color: theme.colors[c] };
      },
    ],
    [
      /^bg-(\w+)$/,
      ([, c], { theme }) => {
        if (customTheme.colors[c])
          return { "background-color": theme.colors[c] };
      },
    ],
    [
      /^bd-(\w+)$/,
      ([, word], { theme }) => {
        const [c, d, t] = word.split("_");
        const matches = (d || "").match(/\d+/);
        const extractedNumber = matches ? parseInt(matches[0], 10) : 1;
        if (customTheme.colors[c])
          return {
            border: `${extractedNumber}px ${t || "solid"} ${theme.colors[c]}`,
          };
      },
    ],
    [
      /^fs-(\d+)$/,
      ([, d]) => {
        return {
          "font-size": `${d}px`,
        };
      },
    ],
    [
      /^g-(\d+)$/,
      ([, d]) => {
        return {
          gap: `${d}px`,
        };
      },
    ],
    [
      /^br-(\d+)$/,
      ([, d]) => {
        return {
          "border-radius": `${d}px !important`,
        };
      },
    ],
  ],
  shortcuts: [
    // Theme shortcuts
    { "bg-app": "bg-bg-main" },
    { "bg-sidebar": "bg-bg-tertiary" },
    { "text-default": "text-text-normal" },
    { "text-subtitle": "text-text-muted" },
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      provider: "google", // 默认提供者
      fonts: {},
    }),
    presetRemToPx({ baseFontSize: 4 }), //px单位
    presetTheme({
      theme: {
        light: {
          colors: themeColors.light,
        },
        purple: {
          colors: themeColors.purple,
        },
        ocean: {
          colors: themeColors.ocean,
        },
      },
    }),
  ],
  transformers: [
    transformerDirectives({ throwOnMissing: true, enforce: "default" }),
    transformerVariantGroup(),
  ],
  blocklist: ["list-item"],
});
