<template>
  <div class="popup">
    <ol>
      <li class="tips">Scan me on WeChat</li>
      <li class="tips">Add me as a friend</li>
    </ol>
    <img class="png" src="./res/friend.png" alt="" />
    <div class="foot">
      <div class="space"></div>
      <div v-if="version">ver:{{ version }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import CCP from "cc-plugin/src/ccp/entry-render";
import { ChromeConst } from "cc-plugin/src/chrome/const";
import { defineComponent, onMounted, ref } from "vue";
const { CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } = ccui.components;
export default defineComponent({
  name: "popup",
  components: {
    CCInput,
    CCButton,
    CCInputNumber,
    CCSelect,
    CCCheckBox,
    CCColor,
  },
  setup(props, ctx) {
    const title = ref(CCP.manifest.name);
    const version = ref(CCP.manifest.version);
    let longConn: chrome.runtime.Port | null = null;
    function _initLongConn() {
      if (!longConn) {
        console.log("[popup] 初始化长连接");
        if (chrome && chrome.runtime) {
          longConn = chrome.runtime.connect({ name: "popup" });
          longConn.onMessage.addListener((data: any, sender: any) => {
            _onLongConnMsg(data, sender);
          });
        }
      }
    }
    function _onLongConnMsg(data: string, sender: any) {
      // console.log( title);
    }
    onMounted(() => {
      _initLongConn();
    });
    return {
      title,
      version,
      onClickOptions() {
        if (chrome && chrome.tabs) {
          chrome.tabs.create({ url: ChromeConst.html.popup });
        }
      },
      onBtnClickGitHub() {
        console.log("onBtnClickGitHub");
      },
    };
  },
});
</script>
<style scoped lang="less">
.popup {
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 10px;

  .tips {
    color: #000000;
  }
  .foot {
    display: flex;
    flex-direction: row;
    height: 30px;
    align-items: center;

    .space {
      flex: 1;
    }

    .icon {
      margin: 0 3px;
      width: auto;
      height: 20px;
    }
  }
}
</style>
