<template id="setBasicParams">
  <div class="panel-body row">
    <div v-show="isShowCog" style="width:100%">
      <b-input-group prepend="Channel Path">
        <b-input v-model="config.data.url" ></b-input>
        <b-input-group-addon>
          <b-button variant="primary" @click="getPathIdParams">OK<span class="glyphicon glyphicon-save"></span></b-button>
        </b-input-group-addon>
      </b-input-group>
    </div>
    <WidgetParams ref="WidgetParams" v-show="isShowLoad" action="get" @updataVariables="viewLoad"></WidgetParams>
    <b-button variant="primary" @click="showPathIdConfig" style="width:100%">
      <span class="glyphicon glyphicon-cog"></span>
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import Plotly from "plotly.js";
import global_ from '@/components/Common/global.vue';
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import PathProcessor from "@/models/PathProcessor";
import { forEach } from "typescript-collections/dist/lib/arrays";
import { map } from "d3";
import WidgetParams from "@/components/Common/WidgetParams.vue";
import StrMapObjChange from "@/models/StrMapObjChange";

@Component({
    components:{
        WidgetParams
    }
})
export default class setBasicParams extends Vue {
  @Prop() wave!: any;
  pathProcessor = new PathProcessor();
  isShowLoad: boolean = false;
  isShowCog: boolean = false;
  pathId!: string;
  userInputData = new Map<string, string>();
  strMapObjChange = new StrMapObjChange();
  config: WidgetConfig = {
    WidgetComponentName: "WaveView",
    data: {
      url: "10086.data.0/$startTime$/$endTime$/$dotNum$",
      userInputData: "",
      position: {
        x1: "",
        x2: "",
        y1: "",
        y2: ""
      }
    }
  };
  getConfig!: WidgetConfig;
  tempUrl: string = "";
  temp: any = {};

  created() {
    this.config.data.userInputData = this.userInputData;
    this.getConfig = this.config;
    this.updateConfig();
  }
  refresh(){
    var Args: UpdatePayload = {
      action: "get",
      variables: (this.$refs.WidgetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewLoad(Args);
  }
  setConfig(config: WidgetConfig) {
    (this.$refs.WidgetParams as WidgetParams).setVariableInput(config.data.userInputData);
    this.config = config;
    console.log(this.config);
    this.refresh();
  }
  updateUserInputData(){
    this.config.data.userInputData =this.strMapObjChange.strMapToObj((this.$refs.WidgetParams as WidgetParams).getVariableValues());
    this.updateConfig();
  }
  updateConfig() {
    this.getConfig = this.config;
    this.$emit("updateConfig", this.getConfig);
  }
  getPathIdParams() {
    if (this.tempUrl != this.config.data.url) {
      this.config.data.userInputData.clear();
      this.tempUrl = this.config.data.url;
    }
    this.updateConfig();
    var url = this.config.data.url;
    this.pathId = url.slice(0, url.indexOf("/"));
    (this.$refs.WidgetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
    this.isShowLoad = true;
    this.isShowCog = false;
  }
  showPathIdConfig() {
    if(this.isShowCog || this.isShowLoad){
      this.isShowCog = !this.isShowCog;
      this.isShowLoad = !this.isShowLoad;
    }else{
      this.isShowCog = !this.isShowCog;
    }
  }
  async viewLoad(Args: UpdatePayload) {
    this.getConfig.data.position.x1 = "";
    this.getConfig.data.position.x2 = "";
    this.getConfig.data.position.y1 = "";
    this.getConfig.data.position.y2 = "";
    this.config.data.userInputData = Args.variables;
    var url = this.pathProcessor.FillPathWithVar(
      this.config.data.userInputData,
      this.config.data.url
    );
    console.log(this.config);
    var path = this.pathId;
    this.$emit("getPathId", path);
    await this.getData(url);
    await this.getDataTimeAxis(url);
    var myPlot = this.wave;
    var data_initial = [
      {
        x: this.temp.dataTimeAxis,
        y: this.temp.data
      }
    ];
    var layout_initial = {
      xaxis: {
        range: [this.config.data.position.x1, this.config.data.position.x2]
      },
      yaxis: {
        range: [this.config.data.position.y1, this.config.data.position.y2]
      }
    };
    this.createChannelChart(myPlot, data_initial, layout_initial);
    this.updateConfig();

    var requiredDotNum = this.temp.dataTimeAxis.length;
    var reAskDataScale = 0.8;
    var zoom_xmax = this.temp.dataTimeAxis[this.temp.dataTimeAxis.length - 1];
    var zoom_xmin = this.temp.dataTimeAxis[0];
    var nowRange = zoom_xmax - zoom_xmin;
    var nowDotNum = this.temp.dataTimeAxis.length;
    var getData = this.getData;
    var getDataTimeAxis = this.getDataTimeAxis;
    var createChannelChart = this.createChannelChart;
    var temp = this.temp;
    var getConfig = this.getConfig;
    var updateConfig = this.updateConfig;

    zoom();
    function zoom() {
      myPlot.on("plotly_relayout", function(data: any) {
        if (!data["xaxis.autorange"]) {
          var nowZoom_xmin = data["xaxis.range[0]"];
          var nowZoom_xmax = data["xaxis.range[1]"];
          var x_range = nowZoom_xmax - nowZoom_xmin;
          var newZoomedDotNum = Math.round((x_range * nowDotNum) / nowRange);
          nowRange = x_range;
          nowDotNum = newZoomedDotNum;
          if (
            nowDotNum < requiredDotNum * 0.5 ||
            nowZoom_xmin < zoom_xmin ||
            nowZoom_xmax > zoom_xmax
          ) {
            zoom_xmax = nowZoom_xmax;
            zoom_xmin = nowZoom_xmin;
            var zoom_ymin = data["yaxis.range[0]"];
            var zoom_ymax = data["yaxis.range[1]"];
            var url =
              path +
              "/" +
              (zoom_xmin * reAskDataScale).toString() +
              "/" +
              (zoom_xmax / reAskDataScale).toString() +
              "/" +
              requiredDotNum;
            getConfig.data.position.x1 = zoom_xmin;
            getConfig.data.position.x2 = zoom_xmax;
            getConfig.data.position.y1 = zoom_ymin;
            getConfig.data.position.y2 = zoom_ymax;
            updateConfig();
            getData(url);
            getDataTimeAxis(url);
            var data_update = [
              {
                x: temp.dataTimeAxis,
                y: temp.data
              }
            ];
            var layout_update = {
              xaxis: {
                range: [zoom_xmin, zoom_xmax]
              },
              yaxis: {
                range: [zoom_ymin, zoom_ymax]
              }
            };
            createChannelChart(myPlot, data_update, layout_update);
            zoom();
          }
        }
      });
      myPlot.on("plotly_doubleclick", function() {
        nowRange = temp.dataTimeAxis[temp.dataTimeAxis.length - 1];
        nowDotNum = temp.dataTimeAxis.length;
        createChannelChart(myPlot, data_initial);
        zoom();
      });
    }
  }
  createChannelChart(myPlot: any, data_update: any, data_layout: any = {}) {
    data_layout.margin = { t: 20 };

    var config = {
      modeBarButtonsToRemove: ["resetScale2d"],
      displaylogo: false
    };

    Plotly.newPlot(myPlot, data_update, data_layout, config);
  }
  async getData(url: string) {
    var apiLoad = global_.thingPath + "/DataByTimeFuzzy/" + url;
    await axios.get(apiLoad).then(response => {
      this.temp.data = response.data.ObjectVal;
    });
  }
  async getDataTimeAxis(url: string) {
    var apiLoad = global_.thingPath + "/DataByTimeFuzzyTimeAxis/" + url;
    await axios.get(apiLoad).then(response => {
      this.temp.dataTimeAxis = response.data.ObjectVal;
    });
  }
}
</script>
<style scoped>
</style>
