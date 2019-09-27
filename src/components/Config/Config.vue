<template>
  <b-container class="bv-example-row">
    <b-row style="margin-top:10px">
      <b-col>
        <span style="float:left;" class="smallFont">Path: {{ config.data.get.url }}</span>
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
        <div
          style="width:100%;overflow:auto;border-style: solid; border-width: 1px;"
        >
          <p style="float:left;margin:0px" class="largeFont">{{ getConfigValue }}</p>
        </div>
      </b-col>
    </b-row>

    <br />

    <b-row>
      <b-col>
        <b-input-group size="lg" prepend="getPath" v-show="isShowGetPath">
          <b-form-input v-model="config.data.get.url"></b-form-input>
          <b-input-group-append>
            <b-button @click="updateGetUI" text="Button" variant="primary">OK</b-button>
            <b-button variant="info" @click="getPathPoke">poke</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <WidgetParams
          ref="WidgetGetParams"
          v-show="isShowGetParams"
          action="get"
          @updataVariables="viewGetLoad"
        ></WidgetParams>
      </b-col>
    </b-row>

    <br />

    <b-row>
      <b-col>
        <b-input-group size="lg" prepend="setPath" v-show="isShowSetPath">
          <b-form-input v-model="config.data.set.url"></b-form-input>
          <b-input-group-append>
            <b-button @click="updateSetUI" text="Button" variant="primary">OK</b-button>
            <b-button variant="info" @click="setPathPoke">poke</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <WidgetParams
          ref="WidgetSetParams"
          v-show="isShowSetParams"
          action="set"
          @updataVariables="viewSetLoad"
        ></WidgetParams>
      </b-col>
    </b-row>

    <br />
    <b-row>
      <b-col>
        <Navigation ref="FamilyLink" :url="config.data.get.url"></Navigation>
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
import { Widget } from "@/models/widget";
import { ResourceInfo } from "@/models/Customview";
import WidgetParams from "@/components/Common/WidgetParams.vue";
import axios from "axios";
import Plotly from "plotly.js";
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
export default class Config extends Widget {
  pathProcessor = new PathProcessor();
  strMapObjChange = new StrMapObjChange();
  WidgetComponentName: string = "Config";
  getConfigValue: string = " ";
  setConfigValue: string = "";
  pathId: string = "";
  userGetInputData = new Map<string, string>();
  userSetInputData = new Map<string, string>();
  getPathwithVar: string = "";
  setPathwithVar: string = "";
  isShowGetPath: boolean = false;
  isShowSetPath: boolean = false;
  isShowGetParams: boolean = false;
  isShowSetParams: boolean = false;

  isSetPoke: boolean = false;
  isGetPoke: boolean = false;

  config: WidgetConfig = {
    WidgetComponentName: "Status",
    data: {
      get: { url: "", userInputData: "" },
      set: { url: "", userInputData: "" }
    }
  };

  created() {
    // this.config.data.userInputData = this.userInputData;
    this.config.data.get.userInputData = this.strMapObjChange.strMapToObj(
      this.userGetInputData
    );
    this.config.data.set.userInputData = this.strMapObjChange.strMapToObj(
      this.userSetInputData
    );
  }

  updateUI() {
    this.updateGetUI();
    this.updateSetUI();
  }

  updateGetUI() {
    this.isShowGetParams = true;
    this.isShowGetPath = false;
    var url = this.config.data.get.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetGetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
  }

  updateSetUI() {
    this.isShowSetParams = true;
    this.isShowSetPath = false;
    var url = this.config.data.set.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetSetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
  }

  showPathConfig() {
    if (this.isShowGetPath == this.isShowSetPath) {
      this.isShowGetPath = !this.isShowGetPath;
      this.isShowSetPath = !this.isShowSetPath;
    } else {
      this.isShowGetPath = true;
      this.isShowSetPath = true;
    }
  }

  getConfig(): WidgetConfig {
    // this.config.data.userInputData =(this.$refs.WidgetParams as WidgetParams).getVariableValues();
    this.config.data.get.userInputData = this.strMapObjChange.strMapToObj(
      (this.$refs.WidgetGetParams as WidgetParams).getVariableValues()
    );
    this.config.data.set.userInputData = this.strMapObjChange.strMapToObj(
      (this.$refs.WidgetSetParams as WidgetParams).getVariableValues()
    );
    return this.config;
  }

  setConfig(widgetConfig: WidgetConfig): void {
    this.config = widgetConfig;
    this.updateUI();
    //map不能序列化，必须要单独处理，这里的处理方法仅限map<string,string>类型
    //布置get输入参数
    var temp = this.config.data.get.userInputData;
    temp = JSON.parse(JSON.stringify(temp));
    temp = this.strMapObjChange.objToStrMap(temp);
    this.userGetInputData = temp;
    (this.$refs.WidgetGetParams as WidgetParams).setVariableInput(
      this.userGetInputData
    );
    //布置set输入参数
    temp = this.config.data.set.userInputData;
    temp = JSON.parse(JSON.stringify(temp));
    temp = this.strMapObjChange.objToStrMap(temp);
    this.userSetInputData = temp;
    (this.$refs.WidgetSetParams as WidgetParams).setVariableInput(
      this.userSetInputData
    );
  }

  samplePoke(sample: any) {
    var samplePath = sample.CFET2CORE_SAMPLE_PATH;
    var pokedPath: string;
    pokedPath = samplePath;
    var count: number = 0;

    if (this.isSetPoke == false || this.isGetPoke == true) {
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
      this.config.data.get.url = pokedPath;
    }

    if (this.isGetPoke == false || this.isSetPoke == true) {
      pokedPath = samplePath;
      count = 0;

      var settemp = sample.Actions.set.Parameters;
      settemp = JSON.parse(JSON.stringify(settemp));
      settemp = this.strMapObjChange.objToStrMap(settemp);
      var SetParameters: Map<string, string>;
      SetParameters = settemp;

      SetParameters.forEach((value, key) => {
        count++;
        if (count == 1) {
          pokedPath = pokedPath + "?";
        }
        pokedPath = pokedPath + key + "=$" + key + "$&";
      });

      if (count != 0) {
        pokedPath = pokedPath.substring(0, pokedPath.length - 1);
      }
      this.config.data.set.url = pokedPath;
    }
    this.isSetPoke = false;
    this.isGetPoke = false;
  }

  getPathPoke() {
    var f = this.config.data.get.url;
    var pokepath = "a";
    pokepath = f;
    axios.get(pokepath).then(response => {
      this.isGetPoke = true;
      this.samplePoke(response.data);
      this.updateUI();
    });
  }

  setPathPoke() {
    var f = this.config.data.set.url;
    var pokepath = "a";
    pokepath = f;
    axios.get(pokepath).then(response => {
      this.isSetPoke = true;
      this.samplePoke(response.data);
      this.updateUI();
    });
  }

  pathPoke() {
    this.getPathPoke();
    this.setPathPoke();
  }

  replaceStartPath(startPath: string): void {
    this.config.data.get.url.replace("$startPath$", startPath);
    this.config.data.set.url.replace("$startPath$", startPath);
  }

  parentUpdate(payload: UpdatePayload): void {}

  refresh() {
    var GetArgs: UpdatePayload = {
      action: "get",
      variables: (this.$refs
        .WidgetGetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewGetLoad(GetArgs);

    var SetArgs: UpdatePayload = {
      action: "set",
      variables: (this.$refs
        .WidgetSetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewSetLoad(SetArgs);
  }

  async getData(url: string) {
    var apiLoad = url;
    await axios.get(apiLoad, {
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      }).then(response => {
      this.getConfigValue = response.data.CFET2CORE_SAMPLE_VAL;
      if(this.getConfigValue == undefined)
      {
          this.getConfigValue = "undefined";
      }
      console.log(this.getConfigValue);
    });
  }

  async setData(url: string) {
    var apiLoad = url;
    await axios.post(apiLoad, {
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      }).then(response => {
      this.setConfigValue = response.data.CFET2CORE_SAMPLE_VAL;
    });
  }

  //called when widgetParams action clicked
  async viewGetLoad(Args: UpdatePayload) {
    // this.config.data.userInputData = Args.variables;
    this.userGetInputData = Args.variables;
    this.getPathwithVar = this.pathProcessor.FillPathWithVar(
      // this.config.data.userInputData,
      this.userGetInputData,
      this.config.data.get.url
    );
    await this.getData(this.getPathwithVar);
  }

  async viewSetLoad(Args: UpdatePayload) {
    // this.config.data.userInputData = Args.variables;
    this.userSetInputData = Args.variables;
    this.setPathwithVar = this.pathProcessor.FillPathWithVar(
      // this.config.data.userInputData,
      this.userSetInputData,
      this.config.data.set.url
    );
    await this.setData(this.setPathwithVar);
    this.getrefresh();
  }

    getrefresh() {
    var GetArgs: UpdatePayload = {
      action: "get",
      variables: (this.$refs
        .WidgetGetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewGetLoad(GetArgs);
  }

}
</script>

<style scoped>
.waveView {
  width: 100%;
  height: auto;
}
</style>