import CCP from "cc-plugin/src/ccp/entry-render";
import { ChromeConst } from "cc-plugin/src/chrome/const";
import { Msg, RequestSupportData } from "../../core/types";
import { bridge } from "./bridge";
export function init() {
  if (chrome && chrome.devtools) {
    // 对应的是Elements面板的边栏
    chrome.devtools.panels.elements.createSidebarPane(CCP.manifest.name, function (sidebar) {
      sidebar.setObject({ some_data: "some data to show!" });
    });

    // 创建devtools-panel
    let iconPath = "";
    const { icon } = CCP.manifest;
    if (icon && icon["48"]) {
      iconPath = icon["48"];
    }
    chrome.devtools.panels.create(CCP.manifest.name, iconPath, ChromeConst.html.devtools, (panel: chrome.devtools.panels.ExtensionPanel) => {
      console.log("[CC-Inspector] Dev Panel Created!");
      panel.onShown.addListener((window) => {
        // 面板显示，查询是否是cocos游戏
        bridge.send(Msg.RequestSupport, {} as RequestSupportData);
      });
      panel.onHidden.addListener(() => {
        // 面板隐藏
        console.log("panel hide");
      });
      panel.onSearch.addListener(function (action, query) {
        // ctrl+f 查找触发
        console.log("panel search!");
      });
    });
  }
}
