<template>
  <div id="devtools">
    <Test v-if="false"> </Test>
    <div class="head" v-show="iframes.length > 1">
      <div class="label">inspect target:</div>
      <CCSelect v-model:value="frameID" @change="onChangeFrame" :data="getFramesData()"> </CCSelect>
    </div>
    <div v-if="isShowDebug" class="find">
      <div v-if="false">
        <CCButton type="success" @click="onMemoryTest">内存测试</CCButton>
        <span>JS堆栈限制: {{ memory.performance.jsHeapSizeLimit }}</span>
        <span>JS堆栈大小: {{ memory.performance.totalJSHeapSize }}</span>
        <span>JS堆栈使用: {{ memory.performance.usedJSHeapSize }}</span>
      </div>
      <Hierarchy></Hierarchy>
      <CCDivider></CCDivider>
      <Inspector></Inspector>
    </div>
    <Find v-if="!isShowDebug"></Find>
    <CCDialog></CCDialog>
    <CCMenu></CCMenu>
    <CCFootBar :version="version"></CCFootBar>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { storeToRefs } from "pinia";
import { defineComponent, onMounted, onUnmounted, ref, toRaw } from "vue";
import PluginConfig from "../../../cc-plugin.config";
import { Msg, PluginEvent, RequestUseFrameData, ResponseSupportData, ResponseUseFrameData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { FrameDetails, NodeInfoData, TreeData } from "./data";
import Find from "./find.vue";
import Hierarchy from "./hierarchy.vue";
import Inspector from "./inspector.vue";
import { appStore } from "./store";
import Test from "./test/test.vue";
import { Timer } from "./timer";
import Properties from "./ui/propertys.vue";
import SettingsVue from "./ui/settings.vue";
import { checkSupport } from "./util";
const { CCTree, CCFootBar, CCMenu, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
interface FrameInfo {
  label: string;
  value: number;
}

export default defineComponent({
  components: { Find, Inspector, CCMenu, Hierarchy, Test, CCFootBar, CCDialog, CCTree, CCDivider, CCButtonGroup, Properties, SettingsVue, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  name: "devtools",
  props: {},
  setup(props, ctx) {
    appStore().init();
    const isShowDebug = ref<boolean>(false);
    const iframes = ref<Array<FrameInfo>>([]);
    const { config, frameID } = storeToRefs(appStore());
    const timer = new Timer(() => {
      checkSupport();
    });
    onMounted(() => {
      ccui.footbar.showTipsArray({
        tips: [
          "Press space in the hierarchy to quickly control the display and hiding of nodes", //
          "If you encounter any problems during use, please feel free to contact me",
        ],
      });
      ccui.footbar.registerCmd({
        icon: "github",
        cb: () => {
          window.open("https://github.com/tidys/cc-inspector-chrome");
        },
      });
      ccui.footbar.registerCmd({
        icon: "qq",
        cb: () => {
          window.open("https://jq.qq.com/?_wv=1027&k=5SdPdy2");
        },
      });
      ccui.footbar.registerCmd({
        icon: "support",
        cb: () => {
          window.open("https://github.com/tidys/cc-inspector-chrome/issues");
        },
      });
      Bus.on(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.create();
    });
    onUnmounted(() => {
      Bus.off(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.clean();
    });
    // 问题：没有上下文的权限，只能操作DOM
    function _executeScript(para: Object) {
      // chrome.tabs.executeScript()//v2版本使用的函数
      const tabID = chrome.devtools.inspectedWindow.tabId;
      chrome.scripting.executeScript({ files: ["js/execute.js"], target: { tabId: tabID } }, (results: chrome.scripting.InjectionResult[]) => {});
    }

    function _inspectedCode() {
      let injectCode = "";
      chrome.devtools.inspectedWindow.eval(injectCode, (result, isException) => {
        if (isException) {
          console.error(isException);
        } else {
          console.log(`执行结果：${result}`);
        }
      });
    }
    const funcEnableSchedule = (b: boolean) => {
      if (b) {
        timer.create();
      } else {
        timer.clean();
      }
    };
    bridge.on(Msg.ResponseTreeInfo, (event: PluginEvent) => {
      let data: Array<TreeData> = event.data;
      isShowDebug.value = true;
    });
    bridge.on(Msg.ResponseSupport, (event: PluginEvent) => {
      let data: ResponseSupportData = event.data;
      const isCocosGame: boolean = data.support;
      isShowDebug.value = isCocosGame;
    });
    bridge.on(Msg.ResponseUseFrame, (event: PluginEvent) => {
      const data: ResponseUseFrameData = event.data;
      frameID.value = data.id;
    });
    bridge.on(Msg.ResponseNodeInfo, (event: PluginEvent) => {
      let eventData: NodeInfoData = event.data;
      isShowDebug.value = true;
    });
    bridge.on(Msg.MemoryInfo, (eventData: any) => {
      memory.value = eventData;
    });
    bridge.on(Msg.ResponseError, (event: PluginEvent) => {
      const err: string = event.data;
      ccui.footbar.showError(err);
    });
    bridge.on(Msg.ResponseUpdateFrames, (event: PluginEvent) => {
      let resFrames: FrameDetails[] = event.data;
      iframes.value = resFrames.map((item) => {
        return {
          label: item.url,
          value: item.frameID,
        };
      });
    });

    const memory = ref<{
      performance: {
        jsHeapSizeLimit?: number;
        totalJSHeapSize?: number;
        usedJSHeapSize?: number;
      };
      console: Object;
    }>({
      performance: {},
      console: {},
    });
    // el-tree的渲染key
    const defaultProps = ref<{ children: string; label: string }>({
      children: "children",
      label: "name",
    });

    function onChangeFrame() {
      const id = Number(toRaw(frameID.value));
      bridge.send(Msg.RequestUseFrame, { id } as RequestUseFrameData);
      Bus.emit(BusMsg.ChangeContent, { id } as RequestUseFrameData);
    }
    const elLeft = ref<HTMLDivElement>();
    const version = ref(PluginConfig.manifest.version);
    return {
      version,
      memory,
      defaultProps,
      frameID,
      iframes,
      isShowDebug,

      getFramesData(): Option[] {
        const frames: FrameInfo[] = toRaw(iframes.value);
        const options: Option[] = [];
        frames.forEach((frame) => {
          options.push({
            label: frame.label,
            value: frame.value,
          });
        });
        return options;
      },

      onMemoryTest() {
        bridge.send(Msg.MemoryInfo);
      },

      onChangeFrame,
    };
  },
});
</script>

<style scoped lang="less">
#devtools {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #5c5c5c;
  color: white;

  .head {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px 0;
    border-bottom: solid 1px grey;

    .label {
      color: white;
      font-size: 12px;
      margin: 0 3px;
      margin-right: 5px;
      user-select: none;
    }
  }

  .find {
    display: flex;
    flex: 1;
    flex-direction: row;
    overflow: hidden;
  }
}
</style>
