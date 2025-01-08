<template>
  <div class="property-engine" @click="onPlaceInTree">
    <i class="icon iconfont" :class="getEngineTypeIcon()"></i>
    <div class="type">{{ data.engineType }}</div>
    <div class="name">{{ data.engineName }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRaw } from "vue";
import { Bus, BusMsg } from "../bus";
import { CompType } from "../comp";
import { EngineData } from "../data";
export default defineComponent({
  name: "property-engine",
  components: {},
  props: {
    data: {
      type: Object as PropType<EngineData>,
      default: () => new EngineData(),
    },
  },
  setup(props, context) {
    return {
      onPlaceInTree() {
        Bus.emit(BusMsg.ShowPlace, toRaw(props.data));
      },
      getEngineTypeIcon() {
        const map = {};
        map[CompType.Spirte] = "icon_picture";
        map[CompType.Label] = "icon_text";
        map[CompType.Node] = "icon_node";
        return map[props.data.engineType] || "icon_unknown";
      },
    };
  },
});
</script>

<style scoped lang="less">
@my-height: 20px;
.property-engine {
  cursor: pointer;
  height: @my-height;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: row;
  border: solid #409eff 1px;
  border-radius: 3px;
  align-items: center;
  align-content: center;
  background-color: cornflowerblue;
  height: @my-height;
  align-items: center;
  align-content: center;
  display: flex;
  flex-direction: row;
  margin-right: 2px;
  color: white;
  &:hover {
    color: #414141;
  }
  &:active {
    color: black;
  }
  .icon {
    font-size: 14px;
    width: @my-height;
    margin: 0 1px 0 2px;
  }
  .type {
    font-size: 12px;
    min-width: 80px;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .name {
    user-select: none;
    font-size: 12px;
    flex: 1;
    height: @my-height;
    background-color: #d4873d;
    display: flex;
    padding: 0 5px;
    align-items: center;
    align-content: center;
  }
}
</style>
