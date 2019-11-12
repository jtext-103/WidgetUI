<template>
<div class="waveView">
    <div style="margin-top:10px">
    <b-button style="float:right" @click="del" text="Button" variant="outline-primary"><span class="glyphicon glyphicon-remove"></span></b-button>
    </div>
    <br/>
    <showViewInfo ref="showViewInfo" :pathId="pathId" @showPathIdConfig="showPathIdConfig"></showViewInfo>
    <div ref="wave">
    
    </div>
    <setBasicParams ref="setBasicParams" @getPathId="getPathId" @updateConfig="updateConfig" :wave="wave" :setConfig='config' @pathPoke="pathPoke" @pathPokeTime="pathPokeTime"></setBasicParams>
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
import { Widget } from '@/models/widget';
import { WidgetRef } from "@/models/WidgetRef";
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
    @Prop() index!:number;
    @Prop() widgetList:WidgetRef[] = [];
    WidgetComponentName: string = 'waveView';
    wave: any = '';
    pathId: string = '';
    strMapObjChange = new StrMapObjChange();
    userInputData = new Map<string, string>();
    sampleVal!:any;
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

    del()
    {
        this.$emit('del', this.index);
        console.log("del"+this.index);
    }

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
        this.userInputData = this.strMapObjChange.strMapToObj(
            ((this.$refs.setBasicParams as setBasicParams).getVariableValues())
        );
        var temp = this.userInputData;
        var flag = 0;
        temp = this.strMapObjChange.objToStrMap(temp);
        this.userInputData = temp;
        console.log(this.userInputData);
        console.log(payload.variables);
        this.userInputData.forEach((value, key) => {
            console.log("进来了");
            console.log(key);
            payload.variables.forEach((valueofpayload, keyofpayload) => {
                console.log(key);
                console.log(keyofpayload);
                if(key == keyofpayload){
                    if(value != keyofpayload){
                        flag = 1;
                        this.userInputData.set(key,payload.variables.get(keyofpayload) as string);
                    }
                }
            })
        });
        if(flag == 1){
            (this.$refs.setBasicParams as setBasicParams).setVariableInput(this.userInputData);
            this.updateUI();
            this.refresh();
        }
    }
    showPathIdConfig(){
        (this.$refs.setBasicParams as setBasicParams).showPathIdConfig();
    }
    refresh() {
        (this.$refs.setBasicParams as setBasicParams).refresh();
    }
    updateUI() {
        (this.$refs.setBasicParams as setBasicParams).getSampleParams(this.config.data.url.path);
        if(Array.isArray(this.sampleVal)) {
            (this.$refs.setBasicParams as setBasicParams).sampleLoad(this.sampleVal);
        }
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
        this.sampleVal = sample.CFET2CORE_SAMPLE_VAL;
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
    samplePokeWith(sample:any)
    {
        var samplePath = sample.CFET2CORE_SAMPLE_PATH;
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
    samplePokeWithTime(sample:any)
    {
        var samplePath = sample.CFET2CORE_SAMPLE_PATH;
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
        this.config.data.url.timePath = pokedPath;
    }
    async pathPoke()
    {
        (this.$refs.setBasicParams as setBasicParams).updateConfig();
        var f = this.config.data.url.path; 
        var pokepath = "a";
        pokepath = f;
        console.log(this.config.data.url.path);
        await axios.get(this.config.data.url.path).then(response => {
            this.samplePokeWith(response.data);
        });
        if(this.config.data.url.path != '' && this.config.data.url.timePath != ''){
            (this.$refs.setBasicParams as setBasicParams).getPathIdParams();
        }
    }
    async pathPokeTime()
    {
        (this.$refs.setBasicParams as setBasicParams).updateConfig();
        var f = this.config.data.url.timePath; 
        var pokepath = "a";
        pokepath = f;
        console.log(this.config.data.url.timePath);
        await axios.get(this.config.data.url.timePath).then(response => {
            this.samplePokeWithTime(response.data);
        });
        if(this.config.data.url.path != '' && this.config.data.url.timePath != ''){
            (this.$refs.setBasicParams as setBasicParams).getPathIdParams();
        }
    }
}
</script>

<style scoped>
.waveView{
    width:100%;
    height: auto;
}
</style>