function createPluginMenus() {
  const menus = [];

  let parent = chrome.contextMenus.create({
    id: "parent",
    title: "CC-Inspector",
  });
  chrome.contextMenus.create({
    id: "test",
    title: "测试右键菜单",
    parentId: parent,
    // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "notify",
    parentId: parent,
    title: "通知",
  });

  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "test") {
      alert("您点击了右键菜单！");
    } else if (info.menuItemId === "notify") {
      chrome.notifications.create("null", {
        type: "basic",
        iconUrl: "icons/48.png",
        title: "通知",
        message: "测试通知",
      });
    }
  });
}

chrome.contextMenus.removeAll(() => {
  createPluginMenus();
});
