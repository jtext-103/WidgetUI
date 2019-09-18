<template>
<div class="waveView">
    <div class="panel panel-default">
        <button type="button" class="btn btn-primary btn-mid" @click="minus" style="float:right">
            <span class="glyphicon glyphicon-minus"></span>
        </button>
        <button type="button" class="btn btn-primary btn-mid" @click="add" style="float:right">
            <span class="glyphicon glyphicon-plus"></span>
        </button>
        <showViewInfo :pathId="pathId"></showViewInfo>
        <div class="panel-body">
            <div ref="wave">
        
            </div>
        </div>
        <setBasicParams ref="setBasicParams" @getPathId="getPathId" @updateConfig="updateConfig" :wave="wave" :setConfig='config'></setBasicParams>
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import setBasicParams from './setBasicParams.vue';
import showViewInfo from './showViewInfo.vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import global_ from '@/components/Common/global.vue';
import { WidgetConfig } from '@/models/WidgetConfig';
import { UpdatePayload } from '@/models/UpdatePayload';
import { Widget } from '@/models/wiget';


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
    testConfig: WidgetConfig = {
        WidgetComponentName:'waveView',
        data:{
            url:'12306.data.0/$startTime$/$endTime$/$dotNum$',
            userInputData:'',
            position:{
                x1:'',
                x2:'',
                y1:'',
                y2:''
            }
        }
    } 
    
    replaceStartPath(startPath:string):void
    {
        this.config.data.url.replace('$startPath$', startPath);
    }

    getConfig(): WidgetConfig {
        return this.config;
    }
    setConfig(wid:WidgetConfig): void {
        // this.config = wid;
        // this.updateUI();
        // (this.$refs.setBasicParams as setBasicParams).
        // this.refresh();
    }
    parentUpdate(payload: UpdatePayload): void {

    }
    refresh() {
        // (this.$refs.setBasicParams as setBasicParams).viewLoad();
    }
    updateUI() {
        (this.$refs.setBasicParams as setBasicParams).getPathIdParams();
    }
    add() {
        this.setConfig(this.testConfig);
    }
    minus() {
        console.log(this.getConfig());
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
}
</script>

<style scoped>
.waveView{
    width:100%;
    height: auto;
}
</style>