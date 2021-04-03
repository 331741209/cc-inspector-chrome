module.exports = {
  name: "Cocos Creator Inspector",
  version: "1.0.1",
  description: "Cocos Creator Inspector",
  browser_action: {
    default_title: "CC-Inspector",
    default_icon: "icon/icon48.png",
    default_popup: "popup.html"
  },
  icons: {
    48: "icon/icon48.png"
  },
  devtools_page: "devtools_panel.html",
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["js/content.js"],
      run_at: "document_end",
      all_frames: true
    }
  ],
  background: {
    scripts: ["js/background.js"],
    persistent: false,// 需要时开启
  },
  // optionsV1的写法
  options_page: "options.html",
  // optionsV2的写法
  options_ui: {
    page: "options.html",
    // 添加一些默认的样式，推荐使用
    chrome_style: true,
  },
  manifest_version: 2,
  permissions: [
    "tabs",
    "http://*/*",
    "https://*/*",
    "*://*/*",
    "audio",
    "system.cpu",
    "clipboardRead",
    "clipboardWrite",
    "system.memory",
    "processes",// 这个权限只在chrome-dev版本都才有
    "tabs",
    "storage",
    "nativeMessaging",
    "contextMenus",
    "notifications",
  ],
  web_accessible_resources: ["*/*", "*"],
  content_security_policy: "script-src 'self' 'unsafe-eval';  object-src 'self'"
}
