<template>
  <b-container class="bv-example-row">
    <b-row style="margin-top:10px">
      <b-col>
        <span style="float:left;" v-show = "!isShowPath" class="largeFont" v-if = "config.data.displayname != ''">{{ config.data.displayname }}</span>
        <span style="float:left;" v-show = "!isShowPath" class="largeFont" v-if = "config.data.displayname == ''">{{ config.data.url }}</span>
        <b-form-input v-show="isShowPath" v-model="config.data.displayname"></b-form-input>
      </b-col>
      <b-col>
        <b-button @click="showPathConfig" variant="primary" style="float:right">
          <span class="glyphicon glyphicon-cog"></span>
        </b-button>
      </b-col>
    </b-row>

    <br />

    <b-row>
      <b-col>
        <b-input-group size="lg" prepend="path" v-show="isShowPath">
          <b-form-input v-model="config.data.url"></b-form-input>
          <b-input-group-append>
            <b-button @click="updateUI" text="Button" variant="primary">OK</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <WidgetParams
          ref="WidgetParams"
          v-show="isShowParams"
          action="broadcast"
          @updataVariables="viewLoad"
        ></WidgetParams>
      </b-col>
    </b-row>

    <br />
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import PubSub from 'pubsub-js';
import { VueSvgGauge } from "vue-svg-gauge";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import { Widget } from "@/models/widget";
import { ResourceInfo } from "@/models/Customview";
import WidgetParams from "@/components/Common/WidgetParams.vue";
import axios from "axios";
import PathProcessor from "@/models/PathProcessor";
import StrMapObjChange from "@/models/StrMapObjChange";
import { forEach } from "typescript-collections/dist/lib/arrays";
import { map } from "d3";
import Navigation from "@/components/Common/Navigation.vue";

@Component({
  components: {
    WidgetParams,
    Navigation
  }
})
export default class VarBroadcast extends Widget {
  pathProcessor = new PathProcessor();
  strMapObjChange = new StrMapObjChange();
  WidgetComponentName: string = "VarBroadcast";
  StatusValue: string = "";
  pathId: string = "";
  userInputData = new Map<string, string>();
  pathwithVar: string = "";
  timer?: number;
  isShowPath: boolean = false;
  isShowParams: boolean = false;

  config: WidgetConfig = {
    WidgetComponentName: "VarBroadcast",
    data: {
      url: "",
      displayname:"",
      userInputData: ""
    }
  };

  created() {
    this.config.data.userInputData = this.strMapObjChange.strMapToObj(
      this.userInputData
    );
  }

  updateUI() {
    this.isShowPath = false;
    this.isShowParams = true;
    var url = this.config.data.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
  }

  showPathConfig() {
    this.isShowPath = !this.isShowPath;
  }

  getConfig(): WidgetConfig {
    // this.config.data.userInputData =(this.$refs.WidgetParams as WidgetParams).getVariableValues();
    this.config.data.userInputData = this.strMapObjChange.strMapToObj(
      (this.$refs.WidgetParams as WidgetParams).getVariableValues()
    );
    return this.config;
  }

  setConfig(widgetConfig: WidgetConfig): void {
    this.config = widgetConfig;
    this.updateUI();
    //map不能序列化，必须要单独处理，这里的处理方法仅限map<string,string>类型
    var temp = this.config.data.userInputData;
    temp = JSON.parse(JSON.stringify(temp));
    temp = this.strMapObjChange.objToStrMap(temp);
    this.userInputData = temp;
    (this.$refs.WidgetParams as WidgetParams).setVariableInput(
      this.userInputData
    );
  }

  samplePoke(sample: any) {
    var samplePath = sample.CFET2CORE_SAMPLE_PATH;
    var pokedPath: string;
    pokedPath = samplePath;
    var count: number = 0;

    var temp = sample.Actions.get.Parameters;
    temp = JSON.parse(JSON.stringify(temp));
    temp = this.strMapObjChange.objToStrMap(temp);
    var Parameters: Map<string, string>;
    Parameters = temp;

    Parameters.forEach((value, key) => {
      count++;
      if (count == 1) {
        pokedPath = pokedPath + "?";
      }
      pokedPath = pokedPath + key + "=$" + key + "$&";
    });

    if (count != 0) {
      pokedPath = pokedPath.substring(0, pokedPath.length - 1);
    }
    this.config.data.url = pokedPath;
  }

  pathPoke() {
    var pokepath = this.config.data.url;
    axios.get(pokepath, {
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      }).then(response => {
      this.samplePoke(response.data);
      this.updateUI();
    });
  }

  replaceStartPath(startPath: string): void {
    this.config.data.url.replace("$startPath$", startPath);
  }

  parentUpdate(payload: UpdatePayload): void {}

  refresh() {
    var Args: UpdatePayload = {
      action: "get",
      variables: (this.$refs.WidgetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewLoad(Args);
  }

  async getData(url: string) {
    var apiLoad = url;
    await axios
      .get(apiLoad, {
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache"
        }
      })
      .then(response => {
        this.StatusValue = response.data.CFET2CORE_SAMPLE_VAL;
        if(this.StatusValue == undefined)
        {
            this.StatusValue = "undefined";
        }
      });
  }

  //called when widgetParams action clicked
  viewLoad(Args: UpdatePayload) {
    // this.config.data.userInputData = Args.variables;
    console.log("viewLoad");
    console.log(Args.variables);
     PubSub.publish('VarBroadcast',Args);
  }
}
</script>

<style scoped>
.waveView {
  width: 100%;
  height: auto;
}
</style>