<template>
  <div class="settings">
    <CCProp name="refresh">
      <CCSelect :value="config.refreshType" :data="refreshOptions" @change="onChangeRefreshType" style="flex: 1"> </CCSelect>
    </CCProp>
    <CCProp name="refresh time: " v-show="isRefreshAuto()">
      <CCInputNumber style="flex: 1" :min="100" :value="config.refreshTime" @change="onChangeRefreshTime"></CCInputNumber>
      <span style="margin: 0 3px">ms</span>
    </CCProp>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { storeToRefs } from "pinia";
import { defineComponent, ref } from "vue";
import { BusMsg } from "../bus";
import { appStore, RefreshType } from "../store";
const { CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCProp, CCColor } = ccui.components;
export default defineComponent({
  name: "settings",
  components: {
    CCProp,
    CCInput,
    CCButton,
    CCInputNumber,
    CCSelect,
    CCCheckBox,
    CCColor,
  },
  props: {},
  setup(props, ctx) {
    const refreshOptions = ref<Array<Option>>([
      { label: "auto", value: RefreshType.Auto },
      { label: "manual", value: RefreshType.Manual },
    ]);
    const { config } = storeToRefs(appStore());
    return {
      config,
      refreshOptions,
      isRefreshAuto() {
        return config.value.refreshType === RefreshType.Auto;
      },
      onChangeRefreshType(type: RefreshType) {
        const store = appStore();
        store.config.refreshType = type;
        store.save();
        bus.emit(BusMsg.UpdateSettings);
      },
      onChangeRefreshTime(v: number) {
        const store = appStore();
        store.config.refreshTime = v;
        store.save();
        bus.emit(BusMsg.UpdateSettings);
      },
    };
  },
});
</script>

<style scoped lang="less">
.settings {
  color: white;
  background-color: #4d4d4d;
}
</style>
