<template>
  <div class="Method">
    <p>{{ config.data.url }}</p>
    <p>{{ MethodResponse }}</p>
    <button @click="showPathConfig">Setting</button>
    <div v-show="isShowPath">
      <input v-model="config.data.url" />
      <button @click="updateUI">OK</button>
    </div>
    <WidgetParams ref="WidgetParams" v-show="isShowParams" action="invoke" :parentUserInputData="userInputData" @updataVariables="viewLoad"></WidgetParams>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import { Widget } from "@/models/wiget";
import WidgetParams from "@/components/Common/WidgetParams.vue";
import axios from "axios";
import Plotly from "plotly.js";
import PathProcessor from "@/models/PathProcessor";
import StrMapObjChange from "@/models/StrMapObjChange";
import { forEach } from "typescript-collections/dist/lib/arrays";
import { map } from "d3";

@Component({
  components: {
    WidgetParams
  }
})
export default class Method extends Widget {
  pathProcessor = new PathProcessor();
  strMapObjChange = new StrMapObjChange();
  WidgetComponentName: string = "Method";
  MethodResponse: string = "";
  pathId: string = "";
  userInputData = new Map<string, string>();
  isShowPath: boolean = false;
  isShowParams: boolean = false;

  config: WidgetConfig = {
    WidgetComponentName: "Method",
    data: {
      url: "",
      userInputData: ""
    }
  };
  tempUrl: string = "";

  created() {
    // this.config.data.userInputData = this.userInputData;
    this.config.data.userInputData = this.strMapObjChange.strMapToObj(this.userInputData);
  }

  updateUI() {
    var url = this.config.data.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
    this.isShowParams = true;
    this.isShowPath = false;
  }

  showPathConfig() {
    this.isShowParams = !this.isShowParams;
    this.isShowPath = !this.isShowPath;
  }

  getConfig(): WidgetConfig {
    // this.config.data.userInputData =(this.$refs.WidgetParams as WidgetParams).getVariableValues();
    this.config.data.userInputData =this.strMapObjChange.strMapToObj((this.$refs.WidgetParams as WidgetParams).getVariableValues());
    return this.config;
  }

  setConfig(widgetConfig: WidgetConfig): void {
    this.config = widgetConfig;
    this.updateUI();
    //map不能序列化，必须要单独处理，这里的处理方法仅限map<string,string>类型
    var temp = this.config.data.userInputData;
    var temp = JSON.parse(JSON.stringify(temp));
    console.log(temp);
    temp = this.strMapObjChange.objToStrMap(temp);
     console.log(temp);
    this.userInputData = temp;
    console.log(this.userInputData);
    (this.$refs.WidgetParams as WidgetParams).setVariableInput(this.userInputData);
  }

  parentUpdate(payload: UpdatePayload): void {
    
  }
  refresh() {
    var Args: UpdatePayload = {
      action: "invoke",
      variables: (this.$refs.WidgetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewLoad(Args);
  }


  async getData(url: string) {
    var apiLoad = url;
    await axios.put(apiLoad).then(response => {
      this.MethodResponse = response.data.ObjectVal;
    });
  }

  //called when widgetParams action clicked
  async viewLoad(Args: UpdatePayload) {
    // this.config.data.userInputData = Args.variables;
    this.userInputData = Args.variables;
    var url = this.pathProcessor.FillPathWithVar(
      // this.config.data.userInputData,
      this.userInputData,
      this.config.data.url
    );

    await this.getData(url);
  }
}
</script>

<style scoped>
.waveView {
  width: 100%;
  height: auto;
}
</style>