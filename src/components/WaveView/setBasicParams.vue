<template>
  <div>
    <div v-show="isShowCog" style="width:100%">
      <b-button-group>
        <b-button variant="success" @click="synchronizeRange(1)">SynchronizeX</b-button>
        <b-button variant="info" @click="synchronizeRange(2)">SynchronizeY</b-button>
        <b-button variant="warning" @click="synchronizeRange(3)">SynchronizeXY</b-button>
      </b-button-group>
      <br>
      <br>
      <b-input-group size="lg" prepend="Channel Path">
        <b-input v-model="config.data.url.path" ></b-input>
        <b-button variant="info" @click="pathPoke">poke</b-button>
      </b-input-group>
      <br>
      <b-input-group size="lg" prepend="Channel TimePath">
        <b-input v-model="config.data.url.timePath" ></b-input>
        <b-input-group-addon>
          <b-button variant="primary" @click="getPathIdParams">OK<span class="glyphicon glyphicon-save"></span></b-button>
          <b-button variant="info" @click="pathPokeTime">poke</b-button>
        </b-input-group-addon>
      </b-input-group>
    </div>
    <WidgetParams ref="WidgetParams" v-show="isShowLoad" action="get" @updataVariables="viewLoad"></WidgetParams>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import axios from "axios";
import Plotly from "plotly.js";
import PubSub from 'pubsub-js';
import global_ from '@/components/Common/global.vue';
import { WidgetConfig } from "@/models/WidgetConfig";
import { UpdatePayload } from "@/models/UpdatePayload";
import PathProcessor from "@/models/PathProcessor";
import { forEach, indexOf } from "typescript-collections/dist/lib/arrays";
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
  tempUserInputData = new Map<string, string>();
  strMapObjChange = new StrMapObjChange();
  config: WidgetConfig = {
    WidgetComponentName: "WaveView",
    data: {
      url: {
        path:'',
        timePath:''
      },
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
  }
  refresh(){
    var Args: UpdatePayload = {
      action: "get",
      variables: (this.$refs.WidgetParams as WidgetParams).getVariableValues(),
      target: ["self"]
    };
    this.viewLoad(Args);
  }

  getVariableValues(): Map<string, string>{
    return (this.$refs.WidgetParams as WidgetParams).getVariableValues();
  }
  
  setVariableInput(parentUserInputData: Map<string, string>) {
    (this.$refs.WidgetParams as WidgetParams).setVariableInput(parentUserInputData);
  }
  pathPoke(){
    this.$emit("pathPoke");
  }
  pathPokeTime(){
    this.$emit("pathPokeTime");
  }
  setConfig(config: WidgetConfig) {
    (this.$refs.WidgetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(config.data.url.path)
    );
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
  getSampleParams(url:any){
    (this.$refs.WidgetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
    this.config.data.url.path = url;
    this.isShowLoad = true;
    this.isShowCog = false;
  }
  getPathIdParams() {
    if (this.tempUrl != this.config.data.url.path) {
      this.config.data.userInputData.clear();
      this.tempUrl = this.config.data.url.path;
    }
    this.updateConfig();
    var url = this.config.data.url.path;
    (this.$refs.WidgetParams as WidgetParams).setVariableList(
      this.pathProcessor.extractVarFromPath(url)
    );
    this.isShowLoad = true;
    this.isShowCog = false;
  }
  getPathIdParamsTime() {
    if (this.tempUrl != this.config.data.url.timePath) {
      this.config.data.userInputData.clear();
      this.tempUrl = this.config.data.url.timePath;
    }
    this.updateConfig();
    var url = this.config.data.url.timePath;
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
  sampleLoad(sampleVal: any){
    var myPlot = this.wave;
    var data_initial = [
      {
        x: this.temp.dataTimeAxis,
        y: sampleVal
      }
    ];
    this.createChannelChart(myPlot, data_initial);
  }

    synchronizeRange(kind:number)
    {
      console.log(kind);
      var myplot = this.wave;
      var xRange = myplot.layout.xaxis.range;
      var yRange = myplot.layout.yaxis.range;
      if(kind == 1)
      {
        PubSub.publish('SynchronizeX',{xrange:xRange,yrange:yRange});
      }
      else if(kind == 2)
      {
        PubSub.publish('SynchronizeY',{xrange:xRange,yrange:yRange});
      }
      else if(kind == 3)
      {
        PubSub.publish('SynchronizeXY',{xrange:xRange,yrange:yRange});
      }
      
    }
    
  findNearest(array:number[],start:number,end:number,num:number):number
  {
    var midIndex:number = (start + end)/2;
    midIndex = Number(midIndex.toFixed(0)) -1;
    if(start>=end){return start}
    var mid=array[midIndex];
    var left=array[(midIndex-1)<start? start:(midIndex-1)];
    var right=array[(midIndex+1)>end? end:(midIndex+1)];
    var sm=Math.abs(num-mid);
    var sl=Math.abs(num-left);
    var sr=Math.abs(num-right);
    if(sm < sl && sm < sr){
            return midIndex;
    }
    else{
            var li= this.findNearest(array,start,midIndex-1, num);
            var ri= this.findNearest(array,midIndex+1, end, num);
            if(Math.abs(num-array[li]) < Math.abs(num-array[ri])){
                return li;
            }
            return ri;
        }
  }
  async viewLoad(Args: UpdatePayload) {
    this.getConfig.data.position.x1 = "";
    this.getConfig.data.position.x2 = "";
    this.getConfig.data.position.y1 = "";
    this.getConfig.data.position.y2 = "";
    this.config.data.userInputData = Args.variables;
    this.tempUserInputData = this.config.data.userInputData;
    var url = this.pathProcessor.FillPathWithVar(
      this.config.data.userInputData,
      this.config.data.url.path
    );
    var timeUrl = this.pathProcessor.FillPathWithVar(
      this.config.data.userInputData,
      this.config.data.url.timePath
    );
    var first = url.indexOf("/");
    var second = url.indexOf("/", first+1);
    var third = url.indexOf("/", second+1)
    var fouth = url.indexOf("/", third+1)
    this.pathId = url.slice(third+1, fouth);
    var thingPath = url.slice(0, url.indexOf('/', 2));
    var path = this.pathId;
    var dealPath = {
      thingPath:thingPath,
      path:path
    }
    this.$emit("getPathId", dealPath);
    await this.getData(url);
    await this.getDataTimeAxis(timeUrl);
    var myPlot = this.wave;
    var data_initial = [
      {
        x: this.temp.dataTimeAxis,
        y: this.temp.data
      }
    ];
    console.log("data_initial:");
    console.log(data_initial);
    var layout_initial = {
      xaxis: {
        range: [this.config.data.position.x1, this.config.data.position.x2]
      },
      yaxis: {
        range: [this.config.data.position.y1, this.config.data.position.y2]
      },
      hovermode:'closest',
      clickmode:'event',
      autosize:true
    };
    console.log(layout_initial);
    this.createChannelChart(myPlot, data_initial, layout_initial);
    this.updateConfig();


    PubSub.subscribe('PlotlyClick',(messageName:string, Args:any)=>{
        console.log("subscribe");
        console.log(Args);
        var nearestIndex:number = this.findNearest(data_initial[0].x, 0 , data_initial[0].x.length-1, Args.x)
        console.log(nearestIndex);
        console.log(data_initial[0].x[nearestIndex]);

        var annotate_text = 'x = '+data_initial[0].x[nearestIndex] +
                        'y = '+data_initial[0].y[nearestIndex];
        var annotation = {
            text: annotate_text,
            x: data_initial[0].x[nearestIndex],
            y: data_initial[0].y[nearestIndex]
          }
        var annotations = [];
          annotations.push(annotation);

        var layout_update = {
              annotations: annotations
        };
      

       Plotly.relayout(myPlot,layout_update);
    });

     PubSub.subscribe('SynchronizeXY',(messageName:string, Args:any)=>{
        console.log("subscribe");
        console.log(Args);

        var layout_update = {
              xaxis: {
                range: Args.xrange
              },
              yaxis: {
                range: Args.yrange
              }
        };
      

       Plotly.relayout(myPlot,layout_update);
    });

    PubSub.subscribe('SynchronizeX',(messageName:string, Args:any)=>{
        console.log("subscribe");
        console.log(Args);

        var layout_update = {
              xaxis: {
                range: Args.xrange
              }
        };
      

       Plotly.relayout(myPlot,layout_update);
    });

    PubSub.subscribe('SynchronizeY',(messageName:string, Args:any)=>{
        console.log("subscribe");
        console.log(Args);

        var layout_update = {
              yaxis: {
                range: Args.yrange
              }
        };
      
       Plotly.relayout(myPlot,layout_update);
    });

    myPlot.on("plotly_click", function(data:any) {
        //当前区域的范围
        console.log(data.points[0].xaxis.range);
        console.log(data.points[0].yaxis.range);
        console.log(data);
        var pts = '';
        for(var i=0; i < data.points.length; i++){
          var annotate_text = 'x = '+data.points[i].x +
                        'y = '+data.points[i].y.toPrecision(4);

          var annotation = {
            text: annotate_text,
            x: data.points[i].x,
            y: parseFloat(data.points[i].y.toPrecision(4))
          }

          var annotations = [];
          annotations.push(annotation);

          Plotly.relayout(myPlot,{annotations: annotations});
          PubSub.publish('PlotlyClick',{x:data.points[i].x,y:data.points[i].y.toPrecision(4)});
      }
    });



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
    var pathProcessor = this.pathProcessor
    var config = this.config;
    var tempUserInputData = this.tempUserInputData;

    console.log("a");
    zoom();
    console.log("b");
    function zoom() {
      console.log("c");
      myPlot.on("plotly_relayout", function(data: any) {
        console.log("d");
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
            var params = [zoom_xmin * reAskDataScale, zoom_xmax / reAskDataScale, requiredDotNum]
            var index = 0;
            for(var key of tempUserInputData.keys()){
              tempUserInputData.set(key, params[index]);
              index++;
            }
            var url = pathProcessor.FillPathWithVar(
              tempUserInputData,
              config.data.url.path
            );
            var timeUrl = pathProcessor.FillPathWithVar(
              tempUserInputData,
              config.data.url.timePath
            );
            console.log(url);
            console.log(timeUrl);
            getConfig.data.position.x1 = zoom_xmin;
            getConfig.data.position.x2 = zoom_xmax;
            getConfig.data.position.y1 = zoom_ymin;
            getConfig.data.position.y2 = zoom_ymax;
            updateConfig();
            // getData(url);
            // getDataTimeAxis(timeUrl);
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
  async getData(url: any) {
    var apiLoad = url;
    console.log(apiLoad);//改
    await axios.get(apiLoad).then(response => {
      this.temp.data = response.data.CFET2CORE_SAMPLE_VAL;
    });
  }
  async getDataTimeAxis(url: any) {
    var apiLoad = url;
    await axios.get(apiLoad).then(response => {
      this.temp.dataTimeAxis = response.data.CFET2CORE_SAMPLE_VAL;
    });
  }
}
</script>
<style scoped>
</style>
