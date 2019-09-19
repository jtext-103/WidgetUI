<template>
  <b-container class="bv-example-row">
    <b-row style="margin-top:10px">
      <b-col>
        <span style="float:left;font-size:20px">getPath: {{ config.data.get.url }}</span>
      </b-col>
      <b-col>
        <b-button @click="showPathConfig" variant="primary" style="float:right"><span class="glyphicon glyphicon-cog"></span></b-button>
      </b-col>
      <hr />
    </b-row>
    <b-row style="margin-top:10px">
      <b-col>
        <span style="float:left;font-size:20px">setPath: {{ config.data.set.url }}</span>
      </b-col>
    </b-row>
    <div style="width:100%">
      <span style="float:left;font-size:20px">getConfigValue:{{ getConfigValue }}</span>
      <div><hr v-show="isShowPath"/></div>
      
      <!-- <span style="float:left;font-size:20px">setConfigValue:{{ setConfigValue }}</span>
      <hr /> -->
    </div>

    <b-input-group prepend="getPath" v-show="isShowPath">
      <b-form-input v-model="config.data.get.url"></b-form-input>
      <b-input-group-append>
        <b-button @click="updateGetUI" size="sm" text="Button" variant="primary">OK</b-button>
      </b-input-group-append>
    </b-input-group>
    <div><hr v-show="isShowGetParams&&isShowPath"/></div>
    <WidgetParams ref="WidgetGetParams" v-show="isShowGetParams&&isShowPath" action="get"  @updataVariables="viewGetLoad" ></WidgetParams>
    <div><hr v-show="isShowPath"/></div>
    <b-input-group prepend="setPath" v-show="isShowPath">
      <b-form-input v-model="config.data.set.url"></b-form-input>
      <b-input-group-append>
        <b-button @click="updateSetUI" size="sm" text="Button" variant="primary">OK</b-button>
      </b-input-group-append>
    </b-input-group>
    <div><hr v-show="isShowSetParams&&isShowPath"/></div>
    <WidgetParams ref="WidgetSetParams" v-show="isShowSetParams&&isShowPath" action="set"  @updataVariables="viewSetLoad" ></WidgetParams>
  </b-container>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import { Widget } from "@/models/wiget";
import { ResourceInfo } from "@/models/Customview";
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
export default class Config extends Widget {
  pathProcessor = new PathProcessor();
  strMapObjChange = new StrMapObjChange();
  WidgetComponentName: string = "Config";
  getConfigValue: string = "";
  setConfigValue: string = "";
  pathId: string = "";
  userGetInputData = new Map<string, string>();
  userSetInputData = new Map<string, string>();
  getPathwithVar:string ="";
  setPathwithVar:string ="";
  timer?:number;
  isShowPath: boolean = false;
  isShowGetParams: boolean = false;
  isShowSetParams: boolean = false;

  config: WidgetConfig = {
    WidgetComponentName: "Status",
    data: {
      get:{url: "",
      userInputData: ""},
      set:{url: "",
      userInputData: ""}
    }
  };

  created() {
    // this.config.data.userInputData = this.userInputData;
    this.config.data.get.userInputData = this.strMapObjChange.strMapToObj(this.userGetInputData);
    this.config.data.set.userInputData = this.strMapObjChange.strMapToObj(this.userSetInputData);
  }

  // mounted()
  // {
  //   this.timer = setInterval(this.refresh,1000);
  // }

  // destroyed() 
  // {
  //   clearInterval(this.timer);
  // }

  updateUI()
  {
    this.updateGetUI();
    this.updateSetUI();
  }

  updateGetUI() {
    this.isShowGetParams = true;
    var url = this.config.data.get.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetGetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
  }

  updateSetUI() {
    this.isShowSetParams = true;
    var url = this.config.data.set.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetSetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
  }

  showPathConfig() {
    this.isShowPath = !this.isShowPath;
  }

  getConfig(): WidgetConfig {
    // this.config.data.userInputData =(this.$refs.WidgetParams as WidgetParams).getVariableValues();
    this.config.data.get.userInputData =this.strMapObjChange.strMapToObj((this.$refs.WidgetGetParams as WidgetParams).getVariableValues());
    this.config.data.set.userInputData =this.strMapObjChange.strMapToObj((this.$refs.WidgetSetParams as WidgetParams).getVariableValues());
    return this.config;
  }

  setConfig(widgetConfig: WidgetConfig): void {
    this.config = widgetConfig;
    this.updateUI();
    //map不能序列化，必须要单独处理，这里的处理方法仅限map<string,string>类型
    //布置get输入参数
    var temp = this.config.data.get.userInputData;
    temp = JSON.parse(JSON.stringify(temp));
    console.log(temp);
    temp = this.strMapObjChange.objToStrMap(temp);
     console.log(temp);
    this.userGetInputData = temp;
    console.log(this.userGetInputData);/*  */
    (this.$refs.WidgetGetParams as WidgetParams).setVariableInput(this.userGetInputData);
    //布置set输入参数
    temp = this.config.data.set.userInputData;
    temp = JSON.parse(JSON.stringify(temp));
    console.log(temp);
    temp = this.strMapObjChange.objToStrMap(temp);
     console.log(temp);
    this.userSetInputData = temp;
    console.log(this.userSetInputData);/*  */
    (this.$refs.WidgetSetParams as WidgetParams).setVariableInput(this.userSetInputData);
  }

  samplePoke(sample:ResourceInfo[],samplePath:string)
  {
    var pokedPath:string;
    pokedPath = samplePath;
    var count:number = 0;

    var getTemp = sample[0].Parameters;
    getTemp = JSON.parse(JSON.stringify(getTemp));
    console.log(getTemp);
    getTemp = this.strMapObjChange.objToStrMap(getTemp);
     console.log(getTemp);
    sample[0].Parameters = getTemp;
    console.log(sample[0].Parameters);

    var setTemp = sample[1].Parameters;
    setTemp = JSON.parse(JSON.stringify(setTemp));
    console.log(setTemp);
    setTemp = this.strMapObjChange.objToStrMap(setTemp);
     console.log(setTemp);
    sample[1].Parameters = setTemp;
    console.log(sample[1].Parameters);

    sample[0].Parameters.forEach((value , key) =>{
          count++;
          if(count == 1)
          {
              pokedPath = pokedPath + "?";
          }
           pokedPath = pokedPath + key + "=$" + key + "$&";
    });
    console.log(pokedPath);
    pokedPath = pokedPath.substring(0,pokedPath.length-1);
    console.log(pokedPath);
    this.config.data.get.url = pokedPath;

    pokedPath = samplePath;
    count = 0;

    sample[1].Parameters.forEach((value , key) =>{
          count++;
          if(count == 1)
          {
              pokedPath = pokedPath + "?";
          }
           pokedPath = pokedPath + key + "=$" + key + "$&";
    });
    console.log(pokedPath);
    pokedPath = pokedPath.substring(0,pokedPath.length-1);
    console.log(pokedPath);
    this.config.data.set.url = pokedPath;
  }

  pathPoke()
  {
      axios.get(this.config.data.url).then(response => {
        var resourcetype = response.data.ResourceType;
        var samplePath = response.data.CFET2CORE_SAMPLE_PATH;
        var sample: ResourceInfo[] = [];
        sample[0] = response.data.Actions.get as ResourceInfo;
        this.samplePoke(sample,samplePath);
      })
  }

  replaceStartPath(startPath:string):void
  {
    this.config.data.get.url.replace('$startPath$', startPath);
    this.config.data.set.url.replace('$startPath$', startPath);
  }

  parentUpdate(payload: UpdatePayload): void {
    
  }

  refresh() {
    var GetArgs: UpdatePayload = {
      action: "get",
      variables: (this.$refs.WidgetGetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewGetLoad(GetArgs);

    var SetArgs: UpdatePayload = {
      action: "set",
      variables: (this.$refs.WidgetSetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewSetLoad(SetArgs);
  }


  async getData(url: string) {
    var apiLoad = url;
    await axios.get(apiLoad).then(response => {
      console.log(response);
      this.getConfigValue = response.data.CFET2CORE_SAMPLE_VAL;
      console.log(this.getConfigValue);
    });
  }

  async setData(url: string) {
    var apiLoad = url;
    await axios.post(apiLoad).then(response => {
      console.log(response);
      this.setConfigValue = response.data.CFET2CORE_SAMPLE_VAL;
      console.log(this.setConfigValue);
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
    console.log(this.getConfigValue);
    console.log(this.getPathwithVar);
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
    console.log(this.setConfigValue);
    console.log(this.setPathwithVar);
    await this.setData(this.setPathwithVar);
  }
}
</script>

<style scoped>
.waveView {
  width: 100%;
  height: auto;
}

</style>