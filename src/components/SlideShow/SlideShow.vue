<template>
  <b-container class="bv-example-row">

    <b-row style="margin-top:10px">
      <b-col>
        <span style="float:left;" size="lg" v-show = "!isShowPath" class="largeFont" v-if = "config.data.displayname != ''">{{ config.data.displayname }}</span>
        <span style="float:left;" size="lg" v-show = "!isShowPath" class="largeFont" v-if = "config.data.displayname == ''">{{ config.data.url }}</span>
        <b-form-input v-show="isShowPath" v-model="config.data.displayname"></b-form-input>
      </b-col>
      <b-col>
        <b-button style="float:right" @click="del" text="Button" variant="outline-primary"><span class="glyphicon glyphicon-remove"></span></b-button>
      </b-col>
    </b-row>

    <b-row style="margin-top:10px">
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
            <b-button variant="info" @click="pathPoke">poke</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <br />

    <b-row>
      <b-col>
        <WidgetParams
          ref="WidgetParams"
          v-show="isShowParams"
          action="get"
          @updataVariables="viewLoad"
        ></WidgetParams>
      </b-col>
    </b-row>

    <br />

     <b-row>
      <b-col>
        <b-img :src ="img[currentImgIndex]" fluid-grow center ></b-img>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <span v-show="isPause" >{{ img[currentImgIndex] }}</span>
      </b-col>
    </b-row>

     <b-row>
      <b-col>
        <b-button-toolbar key-nav class="mx-auto" style="width: 200px;">
          <b-button-group class="mx-1">
            <b-button @click="turnLastImg"  variant="primary" >&lsaquo;</b-button>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-button @click="pauseImg" variant="primary" >Pause</b-button>
            <b-button @click="playImg" variant="primary" >Play</b-button>
          </b-button-group>
          <b-button-group class="mx-1">
            <b-button @click="turnNextImg" variant="primary" >&rsaquo;</b-button>
          </b-button-group>
        </b-button-toolbar>
      </b-col>
    </b-row>

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
import { WidgetRef } from "@/models/WidgetRef";
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
export default class SlideShow extends Widget {
  @Prop() index!:number;
  @Prop() widgetList:WidgetRef[] = [];
  pathProcessor = new PathProcessor();
  strMapObjChange = new StrMapObjChange();
  WidgetComponentName: string = "SlideShow";
  StatusValue: string = "";
  pathId: string = "";
  userInputData = new Map<string, string>();
  pathwithVar: string = "";
  timer?: number;
  isShowPath: boolean = false;     
  isShowParams: boolean = false;
  currentImgIndex: number = -1;
  img:string[] = new Array<string>();
  isPause: boolean = false;


  config: WidgetConfig = {
    WidgetComponentName: "SlideShow",
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

  mounted() {
    this.timer = setInterval(this.showSlide, 100);
    console.log("this.timermounted"+this.timer);
  }

  destroyed() {
    clearInterval(this.timer);
    console.log(this.timer);
  }

  del()
  {
      this.$emit('del', this.index);
      console.log("del"+this.index);
  }

  turnLastImg()
  {
    if(this.isPause == true && this.currentImgIndex >= 0)
    {
      if(this.currentImgIndex == 0)
      {
        this.currentImgIndex = this.img.length - 1;
      }
      else{
        this.currentImgIndex--;
      }
    }
  }

  turnNextImg()
  {
    if(this.isPause == true && this.currentImgIndex >= 0)
    {
      var varTemp:number;
      varTemp = this.currentImgIndex;
      varTemp++;
      this.currentImgIndex = varTemp % this.img.length;
    }
  }

  pauseImg()
  {
     clearInterval(this.timer);
     this.isPause = true;
     console.log("pause"+this.currentImgIndex);
     console.log("this.timerdestroy"+this.timer);
  }

  playImg()
  {
     clearInterval(this.timer);
     console.log("this.timerplaydestroy"+this.timer);
     this.timer = setInterval(this.showSlide, 100);
     this.isPause = false;
     console.log("this.timerplay"+this.timer);
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

  parentUpdate(payload: UpdatePayload): void {
    var shouldUpdate:boolean = false
    this.userInputData = this.strMapObjChange.strMapToObj(
      (this.$refs.WidgetParams as WidgetParams).getVariableValues());
      var temp = this.userInputData;
      temp = this.strMapObjChange.objToStrMap(temp);
      this.userInputData = temp;
      this.userInputData.forEach((value , key) =>{
        payload.variables.forEach((valueofpayload,keyofpayload)=>{
        if(key == keyofpayload && ((this.userInputData.get(key) as string) != (payload.variables.get(keyofpayload) as string)))
        {
          this.userInputData.set(key,payload.variables.get(keyofpayload) as string);
          shouldUpdate = true;
        }
      });
    });

     if(shouldUpdate)
     {
        console.log("I have updated"+this.userInputData);
        (this.$refs.WidgetParams as WidgetParams).setVariableInput(this.userInputData);
        this.updateUI();
        this.refresh();
     }
  }

  showSlide()
  {
    if(this.currentImgIndex != -1 )
    {
      var varTemp:number;
      varTemp = this.currentImgIndex;
      varTemp++;
      this.currentImgIndex = varTemp % this.img.length;
      console.log(this.currentImgIndex);
    }
  }
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
        this.img = response.data.CFET2CORE_SAMPLE_VAL;
        console.log("按了get后此时的值"+this.img)
        if(this.img.length > 0)
        {
          this.currentImgIndex = 0;
        }
      });
  }

  //called when widgetParams action clicked
  async viewLoad(Args: UpdatePayload) {
    // this.config.data.userInputData = Args.variables;
    this.userInputData = Args.variables;
    this.pathwithVar = this.pathProcessor.FillPathWithVar(
      // this.config.data.userInputData,
      this.userInputData,
      this.config.data.url
    );
    console.log("按了get后此时的url"+this.pathwithVar)
    await this.getData(this.pathwithVar);
  }
}
</script>

<style scoped>
.waveView {
  width: 100%;
  height: auto;
}
</style>