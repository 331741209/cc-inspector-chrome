<template>
  <div class="right">
    <CCDock name="Inspector">
      <div class="inspector" @contextmenu.prevent.stop="onMenu">
        <Properties v-if="treeItemData" :data="treeItemData"></Properties>
      </div>
    </CCDock>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { IUiMenuItem } from "@xuyanfeng/cc-ui/types/cc-menu/const";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { Msg, PluginEvent, RequestNodeInfoData, ResponseSupportData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { NodeInfoData } from "./data";
import { Timer } from "./timer";
import Properties from "./ui/propertys.vue";
const { CCDock } = ccui.components;
export default defineComponent({
  components: { Properties, CCDock },
  setup() {
    function updateNodeInfo() {
      if (selectedUUID) {
        console.log(`update node info: ${selectedUUID}`);
        bridge.send(Msg.RequestNodeInfo, { uuid: selectedUUID } as RequestNodeInfoData);
      } else {
        treeItemData.value = null;
      }
    }
    const timer = new Timer(updateNodeInfo);
    const treeItemData = ref<NodeInfoData | null>(null);
    const funcEnableSchedule = (b: boolean) => {
      if (b) {
        timer.create();
      } else {
        timer.clean();
      }
    };
    let selectedUUID: string | null = null;
    const funSelectNode = (uuid: string | null) => {
      selectedUUID = uuid;
      updateNodeInfo();
    };
    function changeContent() {
      selectedUUID = null;
      treeItemData.value = null;
    }

    onMounted(() => {
      Bus.on(BusMsg.ChangeContent, changeContent);
      Bus.on(BusMsg.SelectNode, funSelectNode);
      Bus.on(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.create();
    });
    onUnmounted(() => {
      Bus.off(BusMsg.ChangeContent, changeContent);
      Bus.off(BusMsg.SelectNode, funSelectNode);
      Bus.off(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.clean();
    });
    bridge.on(Msg.ResponseSupport, (event: PluginEvent) => {
      let data: ResponseSupportData = event.data;
      const isCocosGame: boolean = data.support;
      if (isCocosGame) {
      } else {
        treeItemData.value = null;
      }
    });
    let simpleProperties = true;
    bridge.on(Msg.ResponseNodeInfo, (event: PluginEvent) => {
      try {
        // 因为要用到class的一些属性，传递过来的是纯数据，所以需要重新序列化一下
        let eventData: NodeInfoData = event.data;
        const nodeInfo = new NodeInfoData(eventData.uuid, eventData.group).parse(eventData, simpleProperties);
        treeItemData.value = nodeInfo;
      } catch (error) {
        console.error(error);
        ccui.footbar.showError(error, { title: "parse property error" });
      }
    });

    return {
      treeItemData,
      onMenu(evnet: MouseEvent) {
        const menus: IUiMenuItem[] = [];
        menus.push({
          name: "update node info",
          callback: () => {
            updateNodeInfo();
          },
        });
        menus.push({
          name: simpleProperties ? "show more properties" : "show simple properties",
          callback: () => {
            simpleProperties = !simpleProperties;
          },
        });
        ccui.menu.showMenuByMouseEvent(evnet, menus);
      },
    };
  },
});
</script>
<style lang="less" scoped>
.right {
  flex: 1;
  display: flex;
  overflow-x: hidden;
  overflow-y: overlay;
  .inspector {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }
}
</style>
