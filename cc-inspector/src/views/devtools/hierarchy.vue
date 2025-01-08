<template>
  <div class="left">
    <CCDock name="Hierarchy">
      <CCInput style="flex: none" placeholder="enter keywords to filter" :data="filterText" v-if="false">
        <slot>
          <i class="matchCase iconfont icon_font_size" @click.stop="onChangeCase" title="match case" :style="{ color: matchCase ? 'red' : '' }"></i>
        </slot>
      </CCInput>
      <CCTree @contextmenu.prevent.stop="onMenu" style="flex: 1" ref="elTree" :expand-keys="expandedKeys" :default-expand-all="false" :value="treeData" @node-expand="onNodeExpand" @node-collapse="onNodeCollapse" @node-click="handleNodeClick" @node-unclick="handleNodeUnclick"></CCTree>
    </CCDock>
  </div>
</template>
<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { IUiMenuItem } from "@xuyanfeng/cc-ui/types/cc-menu/const";
import Mousetrap, { MousetrapInstance } from "mousetrap";
import { storeToRefs } from "pinia";
import { defineComponent, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from "vue";
import { Msg, PluginEvent, RequestTreeInfoData, RequestUseFrameData, ResponseSetPropertyData } from "../../core/types";
import { bridge } from "./bridge";
import { Bus, BusMsg } from "./bus";
import { EngineData, TreeData } from "./data";
import { appStore } from "./store";
import { Timer } from "./timer";
const { CCTree, CCFootBar, CCDock, CCDialog, CCInput, CCButton, CCInputNumber, CCSelect, CCButtonGroup, CCCheckBox, CCColor, CCDivider } = ccui.components;
export default defineComponent({
  name: "hierarchy",
  components: { CCButtonGroup, CCInput, CCTree, CCDock },
  setup() {
    const funcShowPlace = (data: EngineData) => {
      console.log(data);
      _expand(data.engineNode);
    };
    const funcEnableSchedule = (b: boolean) => {
      if (b) {
        timer.create();
      } else {
        timer.clean();
      }
    };
    const timer: Timer = new Timer(() => {
      updateTree();
    });
    let ins: MousetrapInstance | null = null;
    function onQuickVisible() {
      console.log("onQuickVisible");
      if (selectedUUID) {
        bridge.send(Msg.RequestVisible, selectedUUID);
      }
    }
    function changeContent(data: RequestUseFrameData) {
      treeData.value = [];
      selectedUUID = null;
    }
    onMounted(() => {
      if (elTree.value) {
        const el = toRaw(elTree.value);
        ins = new Mousetrap(el.treeElement);
        ins.bind(["space"], onQuickVisible, "keydown");
      }
      Bus.on(BusMsg.ChangeContent, changeContent);
      Bus.on(BusMsg.ShowPlace, funcShowPlace);
      Bus.on(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.create();
    });
    onUnmounted(() => {
      if (ins) {
        ins.unbind(["space"], "keydown");
      }
      Bus.off(BusMsg.ChangeContent, changeContent);
      Bus.off(BusMsg.ShowPlace, funcShowPlace);
      Bus.off(BusMsg.EnableSchedule, funcEnableSchedule);
      timer.clean();
    });
    function _expand(uuid: string) {
      if (elTree.value) {
        elTree.value.handExpand(uuid, { highlight: true });
      }
    }
    function updateTree() {
      console.log("update tree info");
      const id = toRaw(frameID.value);
      bridge.send(Msg.RequstTreeInfo, { frameID: id } as RequestTreeInfoData);
    }

    function updateFilterText(val: any) {
      (elTree.value as any)?.filter(val);
    }
    const filterText = ref<string>("");
    watch(filterText, (val) => {
      // TODO: 过滤树
      updateFilterText(val);
    });
    const { config, frameID } = storeToRefs(appStore());
    const matchCase = ref<boolean>(false);
    const elTree = ref<typeof CCTree>(null);
    const treeData = ref<TreeData[]>([]);
    let selectedUUID: string | null = null;
    bridge.on(Msg.ResponseTreeInfo, (event: PluginEvent) => {
      let data: Array<TreeData> = event.data;
      if (!Array.isArray(data)) {
        data = [data];
      }
      treeData.value = data;
      nextTick(() => {
        if (elTree.value) {
          elTree.value.handChoose(selectedUUID);
        }
      });
    });

    bridge.on(Msg.ResponseSetProperty, (event: PluginEvent) => {
      let data: ResponseSetPropertyData = event.data;
      const uuid = data.path[0];
      const key = data.path[1];
      const value = data.data;
      let treeArray: Array<TreeData> = [];

      function circle(array: Array<TreeData>) {
        array.forEach((item) => {
          treeArray.push(item);
          circle(item.children);
        });
      }

      // 更新指定uuid节点的tree的name
      circle(treeData.value);
      let ret = treeArray.find((el) => el.id === uuid);
      if (ret) {
        if (key === "name") {
          ret.text = value;
        }
        if (key === "active") {
          ret.active = !!value;
        }
      }
    });
    const expandedKeys = ref<Array<string>>([]);
    function updateSelect(uuid: string | null) {
      selectedUUID = uuid;
      Bus.emit(BusMsg.SelectNode, uuid);
    }
    return {
      expandedKeys,
      elTree,
      filterText,
      treeData,
      matchCase,
      frameID,
      handleNodeUnclick() {
        updateSelect(null);
      },
      handleNodeClick(data: TreeData | null) {
        if (data) {
          updateSelect(data.id);
        } else {
          updateSelect(null);
        }
      },
      onNodeExpand(data: TreeData) {
        if (data.id) {
          expandedKeys.value.push(data.id);
        }
      },
      onNodeCollapse(data: TreeData) {
        if (data.id) {
          const keys = toRaw(expandedKeys.value);
          const index = keys.findIndex((el) => el === data.id);
          if (index !== -1) {
            keys.splice(index, 1);
          }
          expandedKeys.value = keys;
        }
      },
      // TODO: 暂时这个版本先不实现
      filterNode(value: any, data: any) {
        if (!value) {
          return true;
        } else {
          if (matchCase) {
            // 严格匹配大写
            return data?.name?.indexOf(value) !== -1;
          } else {
            return data?.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1;
          }
        }
      },
      onMenu(event: MouseEvent) {
        const menus: IUiMenuItem[] = [];
        menus.push({
          name: "update hierarchy",
          enabled: true,
          callback: () => {
            updateTree();
          },
        });
        if (selectedUUID) {
          menus.push({
            name: "visible (sapce)",
            enabled: true,
            callback: () => {
              onQuickVisible();
            },
          });
          menus.push({
            name: "destroy",
            enabled: true,
            callback: () => {
              bridge.send(Msg.RequestDestroy, selectedUUID);
            },
          });
        }
        ccui.menu.showMenuByMouseEvent(event, menus);
      },
      onChangeCase() {
        matchCase.value = !matchCase.value;
        updateFilterText(filterText);
      },
    };
  },
});
</script>
<style lang="less" scoped>
.left {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  width: 300px;

  .matchCase {
    width: 30px;
    height: 26px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
}
</style>
