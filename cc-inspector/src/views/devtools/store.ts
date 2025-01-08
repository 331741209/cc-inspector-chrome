import profile from "cc-plugin/src/ccp/profile";
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";
import pluginConfig from "../../../cc-plugin.config";
export const enum RefreshType {
  Auto = "auto",
  Manual = "manual",
}
export class ConfigData {
  /**
   * 刷新类型
   */
  refreshType: string = RefreshType.Manual;
  /**
   * 刷新间隔时间，单位ms
   */
  refreshTime: number = 500;
  /**
   * 展开测试的section
   */
  expandTest: boolean = false;
}

export const appStore = defineStore("app", () => {
  const config = ref<ConfigData>(new ConfigData());
  const frameID = ref<number>(0);
  return {
    frameID,
    config,
    init() {
      profile.init(new ConfigData(), pluginConfig);
      const data = profile.load(`${pluginConfig.manifest.name}.json`) as ConfigData;
      config.value.refreshType = data.refreshType || RefreshType.Manual;
      config.value.refreshTime = data.refreshTime || 500;
      config.value.expandTest = !!data.expandTest;
    },
    save() {
      const cfg = toRaw(config.value);
      profile.save(cfg);
    },
  };
});
