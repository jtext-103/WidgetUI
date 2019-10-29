<template>
  <div id="app">
    <b-navbar class="Widget">
      <b-dropdown id="dropdown-1" text="Add Widget" class="m-md-2" variant="primary" size="lg">
        <b-dropdown-item
          v-for="(availableWidget,index) in availableWidgets"
          :key="index"
          class="smallFont"
        >
          <div v-on:click="addWidget(availableWidget)">{{availableWidget}}</div>
        </b-dropdown-item>
      </b-dropdown>
      <b-button
        class="smallFont"
        @click="saveWidgetList"
        style="margin-left:2%"
        variant="primary"
      >Save</b-button>
      <b-form-file
        id="file"
        type="file"
        @change="loadTextFromFile"
        placeholder="Choose a widgetTemplate file to load"
        accept=".json"
        style="width:30%;margin-left:2%"
        class="smallFont"
      />
    </b-navbar>

    <!-- <b-button @click="test">test</b-button> -->

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
      <grid-item
        v-for="(widget) in widgetList"
        :x="widget.x"
        :y="widget.y"
        :w="widget.w"
        :h="widget.h"
        :i="widget.i"
        :key="widget.i"
        drag-allow-from=".vue-draggable-handle"
        drag-ignore-from=".no-drag"
      >
        <div style="border-color: rgb(206, 212, 218);">
          <div class="vue-draggable-handle" style="height:20px;background-color:rgb(0, 123, 255)"></div>
          <component class="no-drag" :is="widget.widgetComponentName" :ref="widget.ref"></component>
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

     

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import axios from "axios";
import { GridItemData, GridLayout, GridItem } from "vue-grid-layout";
import VueRouter from "vue-router";

import { WidgetRef } from "./models/WidgetRef";
import { WidgetConfig, AllWidgetConfig } from "./models/WidgetConfig";
import { Action, UpdatePayload } from "./models/UpdatePayload";
import { Widget } from "./models/widget";
import { ResourceInfo } from "./models/Customview";
import { indexOf } from "typescript-collections/dist/lib/arrays";

//when add more available widgets add ref to the widgets
import Status from "./components/Status/Status.vue";
import WaveView from "./components/WaveView/WaveView.vue";
import Method from "./components/Method/Method.vue";
import Config from "./components/Config/Config.vue";
import Thing from "./components/Thing/Thing.vue";
import State from "./components/State/State.vue";
import VarBroadcast from "./components/VarBroadcast/VarBroadcast.vue";
import AutoBroadcast from "./components/AutoBroadcast/AutoBroadcast.vue";
import SlideShow from "./components/SlideShow/SlideShow.vue";
// import Gauge from "./components/Gauge/Gauge.vue";

//this is the view selecotr class
@Component({
  components: {
    //when add more available widgets add ref to the widgets
    Status,
    WaveView,
    Method,
    Config,
    Thing,
    GridLayout,
    GridItem,
    State,
    VarBroadcast,
    AutoBroadcast,
    SlideShow
  }
})
export default class App extends Vue {
  widgetList: WidgetRef[] = [];
  fileName: string = "widgetTemplate.json";
  private lastWidgetIndex: number = 0;
  isShowAddWidget: Boolean = false;
  text: string = "";

  //when add more available widgets add its name here
  availableWidgets = [
    "Status",
    "Config",
    "WaveView",
    "Method",
    "Thing",
    "State",
    "VarBroadcast",
    "AutoBroadcast",
    "SlideShow"
  ];

  toggleShowAddWidget(): void {
    this.isShowAddWidget = !this.isShowAddWidget;
  }

  pokeAndUpdateUI(ref: string, sample: any) {
    Vue.nextTick(() => {
      ((this.$refs[ref] as Array<Widget>)[0] as Widget).samplePoke(sample);
      ((this.$refs[ref] as Array<Widget>)[0] as Widget).updateUI();
    });
  }

  dataAccess(URL: string) {
    axios
      .get(URL, {
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache"
        }
      })
      .then(dataresponse => {
        var samplePath = dataresponse.data.CFET2CORE_SAMPLE_PATH as string;
        console.log(samplePath);
        samplePath = samplePath.slice(samplePath.lastIndexOf('/')+1);
        console.log(samplePath);
        if(samplePath.startsWith("data")|| samplePath.startsWith("Data"))
        {
          console.log("success");
          this.addWidget("WaveView");
        }
        else{
          var resourcetype = dataresponse.data.ResourceType;
          this.addWidget(resourcetype);
        }
        var tempRef = (this.lastWidgetIndex - 1).toString();
        this.pokeAndUpdateUI(tempRef, dataresponse.data);
      });
  }

 mounted() {
    var fragment = window.location.hash;
    if (fragment != "#blank" && fragment != "#Blank" && fragment != "#") {
      fragment = fragment.substring(1, fragment.length);
      var customViewURL = "/customView/template" + fragment;
      var isCustomview: boolean = false;
      //axios之前出现过cache过多刷不出来的问题，所以本项目的axios都加上了禁止cache的头文件
      axios
        .get(customViewURL, {
          headers: {
            Pragma: "no-cache",
            "Cache-Control": "no-cache"
          }
        })
        .then(response => {
          if (
            response.data.CFET2CORE_SAMPLE_ISVALID == true &&
            response.data.CFET2CORE_SAMPLE_VAL != null
          ) {
            isCustomview = true;
           
            //返回有值的customview template，进行load处理
            var customviewTemplate: string;
            customviewTemplate = response.data.CFET2CORE_SAMPLE_VAL;
            var widgets = Object.assign(
              new AllWidgetConfig(),
              JSON.parse(customviewTemplate)
            );
            this.widgetList = widgets.widgetList;
            this.lastWidgetIndex = Number(widgets.currentRef);
            this.$forceUpdate();
            //替换startpath
            Vue.nextTick(() => {
              // fragment = fragment.substring(1,fragment.length);
              // for (var wid of this.widgetList) {
              //      ((this.$refs[wid.ref] as Array<Widget>)[0] as Widget).replaceStartPath( fragment as string);
              //  }
              //刷新值
              this.importActiveWidgetList();
              // for (var wid of this.widgetList) {
              //   ((this.$refs[wid.ref] as Array<Widget>)[0] as Widget).refresh();
              // }
            });
          }
          else{
            var dataURL = fragment;
            this.dataAccess(dataURL);
          }
        }).catch(err=>{
            var dataURL = fragment;
            this.dataAccess(dataURL);
        });
    }

    PubSub.subscribe("VarBroadcast",(messageName, Args)=>{
      //接收到消息调用全部widget的parentUpdate函数
      for (var widget of this.widgetList) {
      ((this.$refs[widget.ref] as Array<Widget>)[0] as Widget).parentUpdate(Args);}
    });
  }

  exportActiveWidgetList(): AllWidgetConfig {
    for (var widget of this.widgetList) {
      widget.widgetConfig = ((this.$refs[widget.ref] as Array<
        Widget
      >)[0] as Widget).getConfig();
    }
    var widgetConfigList = new AllWidgetConfig();
    widgetConfigList.widgetList = this.widgetList;
    widgetConfigList.currentRef = this.lastWidgetIndex.toString();
    return widgetConfigList;
  }

  importActiveWidgetList() {
    for (var wid of this.widgetList) {
      ((this.$refs[wid.ref] as Array<Widget>)[0] as Widget).setConfig(
        wid.widgetConfig as WidgetConfig
      );
    }
  }

  loadTextFromFile(ev: any) {
    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    var widgets;
    reader.onload = e => {
      widgets = Object.assign(
        new AllWidgetConfig(),
        JSON.parse((e.target as any).result)
      );
      this.widgetList = widgets.widgetList;
      this.lastWidgetIndex = Number(widgets.currentRef);
      this.$forceUpdate();
      Vue.nextTick(() => {
        // changed here
        this.importActiveWidgetList();
      });
    };
  }

  saveWidgetList(): void {
    var data = JSON.stringify(this.exportActiveWidgetList());

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
    newWidget.y = this.lastWidgetIndex * 6;
    newWidget.i = Number(newWidget.ref);
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
.Widget {
  width: 100%;
  border-color: rgb(206, 212, 218);
}
</style>
