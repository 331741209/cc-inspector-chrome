<template>
  <div class="find-game">
    <div style="display: flex; flex-direction: column">
      <span>no games created by cocos creator found!</span>
      <span>{{ msg }}</span>
    </div>
    <i class="fresh iconfont icon_refresh" @click="onBtnClickUpdatePage"></i>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import { Msg, PluginEvent, ResponseSupportData } from "../../core/types";
import { bridge } from "./bridge";
import { checkSupport } from "./util";
export default defineComponent({
  name: "find",
  setup(props) {
    bridge.on(Msg.ResponseSupport, (event: PluginEvent) => {
      let data: ResponseSupportData = event.data;
      const b: boolean = data.support;
      if (b) {
        msg.value = "";
      } else {
        msg.value = data.msg;
      }
    });
    const msg = ref<string>("");
    return {
      msg,
      onBtnClickUpdatePage() {
        checkSupport();
      },
    };
  },
});
</script>
<style lang="less" scoped>
.find-game {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  user-select: none;

  span {
    margin-right: 20px;
    color: white;
    font-size: 20px;
    user-select: none;
  }

  .fresh {
    cursor: pointer;
    color: white;
    font-size: 20px;

    &:hover {
      color: #cef57b;
    }

    &:active {
      color: #ffaa00;
    }
  }
}
</style>
