// @ts-ignore
import { CocosPluginManifest, CocosPluginOptions, Panel } from "cc-plugin/src/declare";

const pkgName = "cc-inspector";

function i18n(key: string) {
  return `i18n:${pkgName}.${key}`;
}

const manifest: CocosPluginManifest = {
  name: pkgName,
  version: "2.1.0",
  description: "cc-inspector desc",
  author: "xu_yanfeng",
  main: "./src/main.ts",
  panels: [
    {
      name: "main",
      type: Panel.Type.DockAble,
      main: "./src/panel/index.ts",
      title: "cc-inspector",
      width: 500,
      height: 400,
      minWidth: 50,
      minHeight: 400,
    },
  ],
  menus: [
    {
      path: `cc-inspector/${i18n("title")}`,
      message: {
        name: "showPanel",
      },
    },
  ],
  i18n_en: "./src/i18n/en.ts",
  i18n_zh: "./src/i18n/zh.ts",
  icon: {
    "48": "./icons/48.png",
  },
  chrome: {
    version: 3,
    pem: "./crx-key.pem",
    view_devtools: "src/views/devtools/index.ts",
    view_options: "src/views/options/index.ts",
    view_popup: "src/views/popup/index.ts",
    script_background: "src/scripts/background/index.ts",
    script_content: "src/scripts/content/index.ts",
    script_inject: "src/scripts/inject/index.ts",
  },
};
const options: CocosPluginOptions = {
  server: {
    enabled: true,
    port: 2022,
    https: true,
    writeToDisk: true,
  },
  watchBuild: true,
  outputProject: {
    web: "./web",
    chrome: "./chrome",
  },
};
export default { manifest, options };
