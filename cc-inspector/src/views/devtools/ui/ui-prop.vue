<template>
  <div class="ui-prop">
    <CCProp :name="name" :icon="icon" :head-width="headWidth" v-model:expand="expand" :arrow="value && value.isArrayOrObject()" :slide="value && value.isNumber()" :indent="indent * 10" @change-expand="onClickFold">
      <div class="prop-value" v-if="value">
        <div v-if="value.isInvalid()" class="invalid">
          {{ formatValue(value.data) }}
        </div>
        <CCInput v-if="value.isString()" v-model:value="value.data" :disabled="value.readonly" @change="onChangeValue"> </CCInput>
        <CCTextarea v-if="value.isText()" v-model:value="value.data" :disabled="value.readonly" @change="onChangeValue"> </CCTextarea>
        <CCInputNumber v-if="value.isNumber()" v-model:value="value.data" :step="step" :disabled="value.readonly" @change="onChangeValue"></CCInputNumber>
        <div v-if="value.isVec2() || value.isVec3() || value.isVec4()" class="vec">
          <UiProp v-for="(vec, index) in value.data" :icon="!!index" head-width="auto" :key="index" :arrow="false" :value="vec.value" :name="vec.name"> </UiProp>
        </div>
        <CCSelect v-if="value.isEnum()" v-model:value="value.data" :disabled="value.readonly" :data="getEnumValues(value)" @change="onChangeValue"> </CCSelect>
        <CCCheckBox v-if="value.isBool()" v-model:value="value.data" :disabled="value.readonly" @change="onChangeValue"> </CCCheckBox>
        <CCColor v-if="value.isColor()" :show-color-text="true" :disabled="value.readonly" v-model:color="value.data" @change="onChangeValue"> </CCColor>
        <PropertyImage v-if="value.isImage()" v-model:data="(value as ImageData)"></PropertyImage>
        <Engine v-if="value.isEngine()" v-model:data="(value as EngineData)"> </Engine>
        <div v-if="value.isObject() && !expand" class="objectDesc"></div>
        <div v-if="value.isArray()" class="array">Array[{{ value.data.length }}]</div>
        <div v-if="value.isObjectCircle()" class="circle-obj" @click="onLogToConsole">circle object can't display, click to log in console</div>
      </div>
    </CCProp>
    <div v-if="value && value.isArrayOrObject()">
      <div v-show="expand && subData && subData.length">
        <UiProp v-for="(arr, index) in subData" :key="index" :indent="indent + 1" :value="arr.value" :name="getName(value.isArray(), arr)"> </UiProp>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import ccui from "@xuyanfeng/cc-ui";
import { Option } from "@xuyanfeng/cc-ui/types/cc-select/const";
import { defineComponent, onMounted, PropType, ref, toRaw, watch } from "vue";
import { Msg, RequestLogData, RequestSetPropertyData } from "../../../core/types";
import { bridge } from "../bridge";
import { ArrayData, EngineData, EnumData, ImageData, Info, NumberData, ObjectData, Property, StringData, TextData, Vec2Data, Vec3Data } from "../data";
import Engine from "./property-engine.vue";
import PropertyImage from "./property-image.vue";
const { CCInput, CCTextarea, CCProp, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor } = ccui.components;
export default defineComponent({
  name: "ui-prop",
  components: { PropertyImage, CCProp, Engine, CCTextarea, CCInput, CCButton, CCInputNumber, CCSelect, CCCheckBox, CCColor },
  props: {
    name: { type: String, default: "" },
    indent: { type: Number, default: 0 },
    icon: { type: Boolean, default: true },
    headWidth: { type: String, default: "120px" },
    arrow: { type: Boolean, default: false },
    step: { type: Number, default: 1 },
    value: {
      type: Object as PropType<Info | EngineData | EnumData | NumberData | StringData | TextData | Vec2Data | Vec3Data | ImageData>,
      default: () => new Info(),
    },
  },
  setup(props, { emit }) {
    const expand = ref(false);
    onMounted(() => {
      expand.value = false;
      freshSubData(props.value);
    });
    watch(
      () => props.value,
      (newData, oldData) => {
        freshSubData(newData);
      }
    );
    const subData = ref<Array<Property>>([]);
    function freshSubData(data: Info) {
      const rawValue = toRaw(data);
      if (!rawValue) {
        return;
      }
      if (rawValue.isArray()) {
        subData.value = (data as ArrayData).data;
      } else if (rawValue.isObject()) {
        subData.value = (data as ObjectData).data;
      }
    }
    return {
      expand,
      subData,
      formatValue(data: any) {
        if (data === null) {
          return "null";
        } else if (data === undefined) {
          return "undefined";
        } else if (data === Infinity) {
          return "Infinity";
        } else if (Number.isNaN(data)) {
          return "NaN";
        } else {
          return data;
        }
      },
      getEnumValues(data: any): Option[] {
        const value: EnumData = data;
        const ret: Option[] = [];
        value.values.map((item) => {
          ret.push({
            label: item.name,
            value: item.value,
          });
        });
        return ret;
      },

      isImageValid() {
        return !!props.value.data;
      },

      getName(isArray: boolean, arr: Property) {
        if (!arr || !arr.value) {
          // debugger;
          return "xxx";
        }
        const type = arr.value.type;
        if (isArray) {
          return arr.name;
        } else {
          return arr.name;
        }
      },
      onClickFold(v: boolean) {
        freshSubData(props.value);
      },
      onChangeValue() {
        if (!props.value.readonly) {
          const raw = toRaw(props.value);
          bridge.send(Msg.RequestSetProperty, raw as RequestSetPropertyData);
        }
      },
      onLogToConsole() {
        const data = toRaw(props.value.path);
        bridge.send(Msg.RequestLogData, data as RequestLogData);
      },
    };
  },
});
</script>

<style scoped lang="less">
.ui-prop {
  display: flex;
  flex-direction: column;
  justify-content: center;
  .prop-value {
    flex: 3;
    text-align: left;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    .invalid {
      user-select: none;
      font-size: 12px;
      color: grey;
    }

    .objectDesc {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: none;
      font-size: 12px;
      color: #d2d2d2;
    }

    .array {
      display: flex;
      flex-direction: column;
      color: #d2d2d2;
      font-size: 12px;
    }
    .circle-obj {
      user-select: none;
      cursor: pointer;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: gray;
      &:hover {
        color: white;
      }
      &:active {
        color: chocolate;
      }
    }

    .vec {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;

      .ui-prop {
        flex: 1;
        .cc-prop {
          overflow: hidden;
        }
      }

      // #ui-prop:first-child {
      //   margin-left: 0;
      // }

      // #ui-prop:last-child {
      //   margin-right: 0;
      // }
    }

    .array-object {
      flex: 1;
      max-width: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .slot {
      display: flex;
      width: 100%;
    }
  }
  .normal-data {
    margin: 0;
    min-height: 30px;
    overflow: hidden;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;

    .key {
      flex: 1;
      float: left;
      text-align: left;
      display: flex;
      flex-direction: row;
      align-items: center;
      min-width: 90px;

      .text {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        user-select: none;
        font-size: 12px;
        margin: 3px;

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
