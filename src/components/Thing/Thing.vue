<template>
  <b-container class="bv-example-row">
    <b-row style="margin-top:10px">
      <b-col>
        <span style="float:left;font-size:20px">path: {{ config.data.url }}</span>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import { Widget } from "@/models/wiget";


export default class Thing extends Widget {
  WidgetComponentName: string = "Thing";
  config: WidgetConfig = {
    WidgetComponentName: "Thing",
    data: {
      url: ""
    }
  };

  getConfig(): WidgetConfig {
    return this.config;
  }

  setConfig(widgetConfig: WidgetConfig): void {
    this.config = widgetConfig;
  }

  replaceStartPath(startPath:string):void
  {
    this.config.data.url.replace('$startPath$', startPath);
  }

  samplePoke(sample:any){}

  pathPoke(){}

  parentUpdate(payload: UpdatePayload): void {
    
  }

  refresh() {
  }

  updateUI(){

  }

}
</script>

<style scoped>
.waveView {
  width: 100%;
  height: auto;
}

</style>