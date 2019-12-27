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
  ExpectedDotNum:number = 1000;
  ExpansionMultiple:number = 1;

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
    console.log("viewLoad");
    var expectedDotNum = this.ExpectedDotNum;
    var expansionMultiple = this.ExpansionMultiple;
    
    var initialStartTime:any = this.tempUserInputData.get("startTime");
    var initialEndTime:any = this.tempUserInputData.get("endTime");
    var initialRange:any = initialEndTime - initialStartTime;
    
    //获取边界值
    var getLimitsInputData = this.tempUserInputData;
    getLimitsInputData.set("startTime","0");
    getLimitsInputData.set("endTime","0");
    getLimitsInputData.set("count","2");
    var timeUrl = this.pathProcessor.FillPathWithVar(
      getLimitsInputData,
      this.config.data.url.timePath
    );
    console.log(timeUrl);
    await this.getDataTimeAxis(timeUrl);
    var xmin =  this.temp.dataTimeAxis[0];
    var xmax =  this.temp.dataTimeAxis[1];
    console.log("边界");
    console.log(xmin);
    console.log(xmax);

    var expansionStartTime:any ;
    var expansionEndTime:any;
    var expansionDotNum:any

    //向左右扩展范围获取数据
    if(initialStartTime == 0 && initialEndTime == 0)
    {
      initialStartTime = xmin;
      initialEndTime = xmax;
      expansionStartTime = xmin;
      expansionEndTime = xmax;
      expansionDotNum = expectedDotNum;
    }
    else{
      expansionStartTime= Number(initialStartTime)-expansionMultiple*initialRange>= xmin?Number(initialStartTime)-expansionMultiple*initialRange:xmin;
      expansionEndTime= Number(initialEndTime)+expansionMultiple*initialRange <= xmax?Number(initialEndTime)+expansionMultiple*initialRange:xmax;
      expansionDotNum =Math.floor(((Number(expansionEndTime)- Number(expansionStartTime)) / (Number(initialEndTime)- Number(initialStartTime)) )*expectedDotNum)+1;
    }

    var getInputData = this.tempUserInputData;
    getInputData.set("startTime", expansionStartTime);
    getInputData.set("endTime",expansionEndTime);
    getInputData.set("count",expansionDotNum);
    var url = this.pathProcessor.FillPathWithVar(
      getInputData,
      this.config.data.url.path
    );
    console.log(url);

    await this.getData(url);

    //当点不够时取全部点并重新获取y轴
    if(this.temp.data == null)
    {
      getInputData.set("count","0");
      url = this.pathProcessor.FillPathWithVar(
      getInputData,
      this.config.data.url.path
      );
      await this.getData(url);
    }


    var timeUrl = this.pathProcessor.FillPathWithVar(
      getInputData,
      this.config.data.url.timePath
    );
    console.log(url);
    console.log(timeUrl);

    await this.getDataTimeAxis(timeUrl);
    


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
        range: [initialStartTime, initialEndTime]
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

    //获取当前波形数据
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

    zoom();
    function zoom() {
      console.log("c");
      myPlot.on("plotly_relayout", function(data: any) {
        console.log("d");
        if (!data["xaxis.autorange"]) {
          var nowZoom_xmin = data["xaxis.range[0]"];
          var nowZoom_xmax = data["xaxis.range[1]"];
          var x_range = nowZoom_xmax - nowZoom_xmin;

          expansionStartTime = Number(nowZoom_xmin)-expansionMultiple*x_range >= xmin?Number(nowZoom_xmin)-expansionMultiple*x_range:xmin;
          expansionEndTime =  Number(nowZoom_xmax)+expansionMultiple*x_range <= xmax? Number(nowZoom_xmax)+expansionMultiple*x_range:xmax;
    
          if (
              expansionStartTime < zoom_xmin ||  
              expansionEndTime > zoom_xmax ||
              ((x_range/nowRange)*nowDotNum < expectedDotNum)
          ) {
            //重新给一遍值
            zoom_xmax = expansionEndTime;
            zoom_xmin = expansionStartTime;
            var zoom_ymin = data["yaxis.range[0]"];
            var zoom_ymax = data["yaxis.range[1]"];
            nowRange = zoom_xmax - zoom_xmin;

            expansionDotNum = Math.floor(((Number(expansionEndTime)- Number(expansionStartTime)) / (Number(nowZoom_xmax)- Number(nowZoom_xmin)) )*expectedDotNum)+1;

            getInputData.set("startTime", expansionStartTime);
            getInputData.set("endTime",expansionEndTime);
            getInputData.set("count",expansionDotNum);

            var url = pathProcessor.FillPathWithVar(
              getInputData,
              config.data.url.path
            );

            getData(url);

            //当点不够时取全部点并重新获取y轴
            if(temp.data == null)
            {
              getInputData.set("count","0");
              url = pathProcessor.FillPathWithVar(
              getInputData,
              config.data.url.path
              );
              getData(url);
            }


            var timeUrl = pathProcessor.FillPathWithVar(
              getInputData,
              config.data.url.timePath
            );
            console.log(url);
            console.log(timeUrl);

            
            getDataTimeAxis(timeUrl);


            getConfig.data.position.x1 = zoom_xmin;
            getConfig.data.position.x2 = zoom_xmax;
            getConfig.data.position.y1 = zoom_ymin;
            getConfig.data.position.y2 = zoom_ymax;
            updateConfig();

            var data_update = [
              {
                x: temp.dataTimeAxis,
                y: temp.data
              }
            ];
            var layout_update = {
              xaxis: {
                range: [data["xaxis.range[0]"],  data["xaxis.range[1]"]]
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
    console.log("getData");//改
    await axios.get(apiLoad).then(response => {
      this.temp.data = response.data.CFET2CORE_SAMPLE_VAL;
      console.log(apiLoad);
      console.log(response);
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
