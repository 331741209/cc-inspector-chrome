<template>
  <div v-if="data.isImage()" class="property-image">
    <div class="box" v-if="data.data">
      <img :src="data.data" alt="图片" @click="onClickImg" class="img" />
    </div>
    <div class="url" :title="data.desc">{{ data.desc }}</div>
    <i class="print iconfont icon_print" @click="onShowValueInConsole"></i>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRaw } from "vue";
import { ImageData } from "../data";

export default defineComponent({
  name: "property-image",
  props: {
    data: {
      type: Object as PropType<ImageData>,
      default: () => new ImageData().test(),
    },
  },
  setup(props) {
    return {
      onClickImg() {
        const url = toRaw(props.data.data);
        if (url && url.startsWith("http")) {
          window.open(url);
        }
      },
      onShowValueInConsole() {
        if (Array.isArray(props.data.path)) {
          let uuid = props.data.path[0];
          let key = props.data.path[1]; // todo 暂时只支持一级key
          if (uuid && key) {
            chrome.devtools.inspectedWindow.eval(`window.CCInspector.logValue('${uuid}','${key}')`);
          }
        }
      },
    };
  },
});
</script>

<style scoped lang="less">
.property-image {
  display: flex;
  overflow: hidden;
  flex: 1;
  flex-direction: row;
  align-content: center;
  align-items: center;
  height: 30px;
  box-sizing: border-box;
  border: 1px solid #409eff;
  border-radius: 2px;
  margin-right: 2px;
  .box {
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-width: 80px;
    width: 80px;
    justify-content: center;
    .img {
      cursor: pointer;
      padding: 2px 0;
      height: 30px;
      width: 30px;
      box-sizing: border-box;
      object-fit: contain;
    }
  }

  .url {
    padding: 0 5px;
    flex: 1;
    color: gray;
    font-weight: normal;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .print {
    cursor: pointer;
    margin-right: 10px;
    color: #d2d2d2;
    &:hover {
      color: #ffffff;
    }
    &:active {
      color: #ffaa00;
    }
  }
}
</style>
