<template>
<div class="waveView">
    <showViewInfo :pathId="pathId"></showViewInfo>
    <div ref="wave">
    
    </div>
    <setBasicParams ref="setBasicParams" @getPathId="getPathId" @updateConfig="updateConfig" :wave="wave" :setConfig='config'></setBasicParams>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import setBasicParams from './setBasicParams.vue';
import showViewInfo from './showViewInfo.vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { WidgetConfig } from '@/models/WidgetConfig';
import { UpdatePayload } from '@/models/UpdatePayload';
import { Widget } from '@/models/wiget';
import StrMapObjChange from "@/models/StrMapObjChange";
import { ResourceInfo } from "@/models/Customview";
import axios from "axios";


@Component({
    components:{
        setBasicParams,
        showViewInfo
    }
})
export default class waveView extends Widget {
    WidgetComponentName: string = 'waveView';
    wave: any = '';
    pathId: string = '';
    strMapObjChange = new StrMapObjChange();
    userInputData = new Map<string, string>();
    config: WidgetConfig = {
        WidgetComponentName: 'WaveView',
        data: {
            url:'',
            userInputData:'',
            position:{
                x1:'',
                x2:'',
                y1:'',
                y2:''
            }
        }
    };

    getConfig(): WidgetConfig {
        (this.$refs.setBasicParams as setBasicParams).updateUserInputData();
        return this.config;
    }

    replaceStartPath(startPath:string)
    {
        this.config.data.url.replace('$startPath$', startPath);
    }
    setConfig(widgetConfig:WidgetConfig): void {
        this.config = widgetConfig;
        var temp = this.config.data.userInputData;
        this.updateUI();
        var temp = JSON.parse(JSON.stringify(temp));
        temp = this.strMapObjChange.objToStrMap(temp);
        widgetConfig.data.userInputData = temp;
        (this.$refs.setBasicParams as setBasicParams).setConfig(widgetConfig);
    }
    parentUpdate(payload: UpdatePayload): void {

    }
    refresh() {
        (this.$refs.setBasicParams as setBasicParams).refresh();
    }
    updateUI() {
        (this.$refs.setBasicParams as setBasicParams).getPathIdParams();
    }
    getPathId(pathId: string) {
        this.pathId = pathId;
    }
    mounted() {
        this.wave = this.$refs.wave;
    }
    updateConfig(data:WidgetConfig){
        this.config = data;
    }
    samplePoke(sample:ResourceInfo[],samplePath:string)
    {
    var pokedPath:string;
    pokedPath = samplePath;
    var count:number = 0;

    var temp = sample[0].Parameters;
    temp = JSON.parse(JSON.stringify(temp));
    console.log(temp);
    temp = this.strMapObjChange.objToStrMap(temp);
     console.log(temp);
    sample[0].Parameters = temp;
    console.log(sample[0].Parameters);

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
    this.config.data.url = pokedPath;
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
}
</script>

<style scoped>
.waveView{
    width:100%;
    height: auto;
}
</style>