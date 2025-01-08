<template>
  <div class="options">
    <ul>
      <li>
        <div class="money">
          <div class="tips">support me with WeChat Pay</div>
          <img class="png" src="./res/money.png" alt="" />
        </div>
      </li>
      <li>
        <a target="_blank" href="https://patreon.com/inspector_game?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink">support me with Patreon</a>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "options",
  components: {},
  setup(props, ctx) {
    return {};
  },
});
</script>
<style scoped lang="less">
.options {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  user-select: none;
  .png {
    width: auto;
    height: 130px;
  }

  .tips {
    text-align: center;
    width: 100%;
    color: #000000;
  }
}
</style>
