<template id="Navigation">
  <div>
    <div style="width:100%;margin:5px">
        <b-button size="lg" @click="showNavigation" style="float:right">Navigation</b-button>
    </div>
    <div v-show="isShowNavigation&&isShowParentPath" style="width:100%;height:25px">
      <b-link :href="parentPath" class="smallFont" style="float:left">parentPath:{{ parentPath }}</b-link>
      <!-- <a class="smallFont" :href="parentPath" style="float:left">parentPath:{{ parentPath }}</a> -->
    </div>
    <div
      v-show="isShowNavigation"
      v-for="(path, index) in childrenPath"
      :key="index"
      style="width:100%;height:25px"
    >
      <b-link :href="path" class="smallFont" style="float:left">childrenPath:{{path}}</b-link>
      <!-- <a class="smallFont" :href= "path" style="float:left">childrenPath:{{path}}</a> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import Plotly from "plotly.js";
import global_ from "@/components/Common/global.vue";
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import PathProcessor from "@/models/PathProcessor";
import { forEach } from "typescript-collections/dist/lib/arrays";
import { map } from "d3";
import WidgetParams from "@/components/Common/WidgetParams.vue";

@Component({
  components: {
    WidgetParams
  }
})
export default class Navigation extends Vue {
  @Prop() url!: string;
  parentPath!: string;
  childrenPath!: string[];
  isShowParentPath: boolean = false;
  isShowNavigation: boolean = false;

  @Watch("url")
  onUrlChanged() {
    this.getPath();
  }
  async getPath() {
    this.isShowParentPath = false;
    var apiLoad = this.url;
    await axios.get(apiLoad).then(response => {
      this.parentPath = response.data.ParentPath as string;
      this.childrenPath = response.data.ChildrenPath as string[];
    });
    if (this.parentPath != "") {
      this.isShowParentPath = true;
    }
    this.$forceUpdate();
  }

  showNavigation() {
    this.isShowNavigation = !this.isShowNavigation;
  }
}
</script>
<style scoped>
</style>