<template>
  <div id="app">
    <b-navbar class="Widget">
      <b-dropdown id="dropdown-1" text="Add Widget" class="m-md-2" variant="primary">
        <b-dropdown-item v-for="(availableWidget,index) in availableWidgets" :key="index">
            <div v-on:click="addWidget(availableWidget)">{{availableWidget}}</div>
        </b-dropdown-item>
      </b-dropdown>
      <b-button @click="saveWidgetList" style="margin-left:2%" variant="primary">Save</b-button>
      <b-form-file  id="file" type="file" @change="loadTextFromFile" placeholder="Choose a widgetTemplate file to laod" accept=".json" style="width:30%;margin-left:2%" />
    </b-navbar>
    

    <grid-layout
            :layout.sync="widgetList"
            :col-num="12"
            :row-height="30"
            :is-draggable="true"
            :is-resizable="true"
            :is-mirrored="false"
            :vertical-compact="true"
            :margin="[10, 10]"
            :use-css-transforms="true"
    >
       <grid-item v-for="(widget) in widgetList"
                   :x="widget.x"
                   :y="widget.y"
                   :w="widget.w"
                   :h="widget.h"
                   :i="widget.i"
                   :key="widget.i">
            <div style="height:20px;background-color:rgb(0, 123, 255)"> </div>
            <component :is="widget.widgetComponentName" :ref="widget.ref"></component>
        </grid-item>
    </grid-layout>

  </div>
</template>

     

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import {  GridItemData,GridLayout,GridItem} from 'vue-grid-layout';

import { WidgetRef } from "./models/WidgetRef";
import { WidgetConfig, AllWidgetConfig } from "./models/WidgetConfig";
import { Action, UpdatePayload } from "./models/UpdatePayload";
import { Widget } from "./models/wiget";

//when add more available widgets add ref to the widgets
import Status from "./components/Status/Status.vue";
import WaveView from "./components/WaveView/WaveView.vue";
import Method from "./components/Method/Method.vue";
import Config from "./components/Config/Config.vue";

//this is the view selecotr class
@Component({
  components: {
    //when add more available widgets add ref to the widgets
    Status,
    WaveView,
    Method,
    Config,
    GridLayout,
    GridItem
  }
})
export default class App extends Vue {
  widgetList: WidgetRef[] = [];
  fileName: string = "config.json";
  private lastWidgetIndex: number = 0;
  isShowAddWidget: Boolean = false;
  text: string = "";

  //when add more available widgets add its name here
  availableWidgets = ["Status", "Config", "WaveView", "Method"];

  toggleShowAddWidget(): void {
    this.isShowAddWidget = !this.isShowAddWidget;
  }

  async UIAutomaticGenerated() {
    var fragment = window.location.hash;
    if (fragment != "#") {
      fragment = fragment.substring(1,fragment.length-1);
      var customViewURL = "/customView" + fragment;
      await axios.get(customViewURL).then(response => {
        var widgets = Object.assign(
        new AllWidgetConfig(),
        JSON.parse(response.data.ObjectVal)
      );
       this.widgetList = widgets.widgetList;
       this.lastWidgetIndex = Number(widgets.currentRef);
       this.importActiveWidgetList();

    });
    }
  }

  exportActiveWidgetList(): AllWidgetConfig {
    for (var widget of this.widgetList) {
      widget.widgetConfig = ((this.$refs[widget.ref] as Array<Widget>)[0] as Widget).getConfig();
    }
    var widgetConfigList = new AllWidgetConfig();
    widgetConfigList.widgetList = this.widgetList;
    widgetConfigList.currentRef = this.lastWidgetIndex.toString();
    console.log(widgetConfigList);
    return widgetConfigList;
  }

  importActiveWidgetList() {
    for (var wid of this.widgetList) {
       ((this.$refs[wid.ref] as Array<Widget>)[0] as Widget).setConfig( wid.widgetConfig as WidgetConfig);
    }
  }


  loadTextFromFile(ev: any) {
    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    var widgets;
    // console.log(this.$refs);
    reader.onload = e => {
      widgets = Object.assign(
        new AllWidgetConfig(),
        JSON.parse((e.target as any).result)
      );
      // console.log(widgets);
      this.widgetList = widgets.widgetList;
      this.lastWidgetIndex = Number(widgets.currentRef);
      this.$forceUpdate();
      Vue.nextTick(() => {                                         // changed here
        this.importActiveWidgetList();
      });  
      // console.log(this.$refs);
    };
    
}

  saveWidgetList(): void {
    var data = JSON.stringify(this.exportActiveWidgetList());
    console.log(data);

    const blob = new Blob([data]);
    if (window.navigator.msSaveOrOpenBlob) {
      // 兼容IE10
      navigator.msSaveBlob(blob, this.fileName);
    } else {
      //  chrome/firefox
      let aTag = document.createElement("a");
      aTag.download = this.fileName;
      aTag.href = URL.createObjectURL(blob);
      aTag.click();
      URL.revokeObjectURL(aTag.href);
    }
  }

  addWidget(widgetName: string): void {
    var newWidget = new WidgetRef();
    newWidget.widgetComponentName = widgetName;
    newWidget.ref = this.lastWidgetIndex.toString();
    newWidget.y=this.lastWidgetIndex*4;
    newWidget.i=Number(newWidget.ref);
    this.lastWidgetIndex++;
    this.widgetList = [...this.widgetList, newWidget];
  }

  update(payload: UpdatePayload) {
    for (var wid of this.widgetList) {
      (this.$refs[wid.ref] as Widget).parentUpdate(payload);
    }
    if (payload.action == "") {
      for (var wid of this.widgetList) {
        (this.$refs[wid.ref] as Widget).refresh();
      }
    }
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.Widget{
  width: 100%;
  border-color: rgb(206, 212, 218);
}
</style>
