<template>
  <div id="app">
    <div class="btn-group">
      <ul>
        <div v-for="(availableWidget,index) in availableWidgets" :key="index">
          <li>
            <a href="#" v-on:click="addWidget(availableWidget)">{{availableWidget}}</a>
          </li>
        </div>
      </ul>
    </div>
    <button @click="saveWidgetList">Save</button>
    <input id="file" type="file" @change="loadTextFromFile" />
    <!-- <button @click="toggleShowAddWidget">Add</button>
    <div v-show="isShowAddWidget">
      <div v-for="(availableWidget,index) in availableWidgets" :key="index">
        <button v-on:click="addWidget(availableWidget)">{{availableWidget}}</button>
      </div>
    </div>-->
    <!-- <div v-for="(widget,index) in widgetList" :key="index">
      <component :is="widget.widgetComponentName" :ref="widget.ref"></component>
    </div> -->

    <grid-layout
            :layout.sync="layout"
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
                   :x="layout[Number(widget.ref)].x"
                   :y="layout[Number(widget.ref)].y"
                   :w="layout[Number(widget.ref)].w"
                   :h="layout[Number(widget.ref)].h"
                   :i="layout[Number(widget.ref)].i"
                   :key="layout[Number(widget.ref)].i">
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
  layout:GridItemData[]=[];
  fileName: string = "config.json";
  private lastWidgetIndex: number = 0;
  isShowAddWidget: Boolean = false;
  text: string = "";

  //when add more available widgets add its name here
  availableWidgets = ["Status", "Config", "WaveView", "Method"];

  toggleShowAddWidget(): void {
    this.isShowAddWidget = !this.isShowAddWidget;
  }

  UIAutomaticGenerated() {
    var fragment = window.location.hash;
    if (fragment != "#") {
      axios
        .get(" ")
        .then(function(response) {
          // handle success
          console.log(response);
        })
        .catch(function(error) {
          // handle error
          console.log(error);
        })
        .then(function() {
          // always executed
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
    this.layout[this.lastWidgetIndex]= {"x":0,"y":this.lastWidgetIndex*4,"w":4,"h":4,"i":newWidget.ref},
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
  margin-top: 60px;
}
</style>
