<template>
<div class="waveView">
    <showViewInfo ref="showViewInfo" :pathId="pathId" @showPathIdConfig="showPathIdConfig"></showViewInfo>
    <div ref="wave">
    
    </div>
    <setBasicParams ref="setBasicParams" @getPathId="getPathId" @updateConfig="updateConfig" :wave="wave" :setConfig='config' @pathPoke="pathPoke"></setBasicParams>
    <Navigation ref="FamilyLink" :url="config.data.url.path" style="margin-top:30px"></Navigation>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import setBasicParams from './setBasicParams.vue';
import showViewInfo from './showViewInfo.vue';
import Navigation from '@/components/Common/Navigation.vue';
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
        showViewInfo,
        Navigation
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
            url:{
                path:'',
                timePath:''
            },
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
        console.log(widgetConfig);
        var temp = this.config.data.userInputData;
        this.updateUI();
        var temp = JSON.parse(JSON.stringify(temp));
        temp = this.strMapObjChange.objToStrMap(temp);
        widgetConfig.data.userInputData = temp;
        console.log(widgetConfig);
        (this.$refs.setBasicParams as setBasicParams).setConfig(widgetConfig);
    }
    parentUpdate(payload: UpdatePayload): void {

    }
    showPathIdConfig(){
        (this.$refs.setBasicParams as setBasicParams).showPathIdConfig();
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
    samplePoke(sample:any)
    {
        var samplePath = sample.CFET2CORE_SAMPLE_PATH;
        console.log(samplePath);
        var pokedPath:string;
        pokedPath = samplePath;
        var count:number = 0;

        var temp = sample.Actions.get.Parameters;
        temp = JSON.parse(JSON.stringify(temp));
        console.log(temp);
        temp = this.strMapObjChange.objToStrMap(temp);
        console.log(temp);
        var Parameters:Map<string, string>;
        Parameters = temp;

        Parameters.forEach((value , key) =>{
            count++;
            if(count == 1)
            {
                pokedPath = pokedPath + "?";
            }
            pokedPath = pokedPath + key + "=$" + key + "$&";
    });
    if(count != 0 )
    {
        pokedPath = pokedPath.substring(0,pokedPath.length-1);
    }
    this.config.data.url.path = pokedPath;
  }

  async pathPoke()
  {
    (this.$refs.setBasicParams as setBasicParams).updateConfig();
    var f = this.config.data.url.path; 
    var pokepath = "a";
    pokepath = f;
    console.log(this.config.data.url.path);
    await axios.get(this.config.data.url.path).then(response => {
        this.samplePoke(response.data);
    });
    (this.$refs.setBasicParams as setBasicParams).getPathIdParams();
  }

}
</script>

<style scoped>
.waveView{
    width:100%;
    height: auto;
}
</style>