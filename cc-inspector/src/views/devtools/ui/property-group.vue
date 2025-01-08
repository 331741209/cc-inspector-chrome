<template>
  <div class="property-group">
    <CCSection :expand="!fold" :name="group.name" :expand-by-full-header="true" :auto-slot-header="true">
      <template v-slot:title>
        <div v-if="visible" @click.stop="">
          <CCCheckBox :value="visible.data" @change="onChangeVisible"> </CCCheckBox>
        </div>
      </template>
      <template v-slot:header>
        <div style="flex: 1"></div>
        <i style="" @click.stop="onLog" class="print iconfont icon_print"></i>
      </template>
      <div style="padding-left: 6px">
        <UiProp v-for="(item, index) in group.data" :key="index" :name="item.name" :value="item.value"> </UiProp>
      </div>
    </CCSection>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { defineComponent, onMounted, onUnmounted, PropType, ref, toRaw, watch } from "vue";
import { Msg, RequestLogData, RequestSetPropertyData } from "../../../core/types";
import { bridge } from "../bridge";
import { Bus, BusMsg } from "../bus";
import { BoolData, Group, Info, Property } from "../data";
import UiProp from "./ui-prop.vue";
import { VisibleProp } from "../comp";
const { CCInput, CCSection, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } = ccui.components;
export default defineComponent({
  name: "property-group",
  components: { UiProp, CCSection, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  props: {
    group: {
      type: Object as PropType<Group>,
      default: () => {
        return new Group("test");
      },
    },
  },
  setup(props, context) {
    const funcFoldAllGroup = (b: boolean) => {
      fold.value = b;
    };
    onMounted(() => {
      Bus.on(BusMsg.FoldAllGroup, funcFoldAllGroup);
    });
    onUnmounted(() => {
      Bus.off(BusMsg.FoldAllGroup, funcFoldAllGroup);
    });
    const fold = ref(false);
    const visible = ref<Info | null>(null);
    let visibleTarget: Property = null;
    watch(
      () => props.group,
      (v) => {
        freshVisible();
      }
    );
    function freshVisible() {
      visibleTarget = props.group.data.find((el) => {
        return el.name === VisibleProp.Enabled || el.name == VisibleProp.Active;
      });
      if (visibleTarget) {
        visible.value = visibleTarget.value;
      } else {
        visible.value = null;
      }
    }
    freshVisible();
    return {
      fold,
      visible,
      onChangeVisible(b: boolean) {
        const raw: BoolData = toRaw<Info>(visibleTarget.value) as BoolData;
        raw.data = b;
        bridge.send(Msg.RequestSetProperty, raw as RequestSetPropertyData);
      },
      onLog() {
        const raw = toRaw(props);
        const data = [raw.group.id];
        bridge.send(Msg.RequestLogData, data as RequestLogData);
      },
    };
  },
});
</script>

<style scoped lang="less">
.property-group {
  .print {
    cursor: pointer;
    margin-right: 10px;
    &:hover {
      color: #ffffff;
    }
    &:active {
      color: #ffaa00;
    }
  }
}
</style>
