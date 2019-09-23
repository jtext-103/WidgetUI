<template>
    <div class="smallFont" style="float:left width:100%">
        <span>Basic Path :&nbsp;{{ basePathId }}</span><br>
        <span> Rate: {{ sampleId }}</span><br>
        <span>length: {{ lengthId }}</span>
        <b-button variant="primary" style="float:right">
            <span class="glyphicon glyphicon-cog" @click="showPathIdConfig"></span>
        </b-button>
        <br>
        <hr />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';

@Component
export default class showViewInfo extends Vue {
    @Prop() pathId!:string;
    basePathId: string = '';
    sampleId: string = '';
    lengthId: string = '';
    @Watch('pathId')
    onPathIdChanged(val:any, oldVal:any) {
        this.show(val);
    }

    showPathIdConfig(){
        this.$emit("showPathIdConfig");
    }
    async show(pathId:string) {
        this.getBasePath(pathId);
        this.getSamplerate(pathId);
        this.getLength(pathId);
    }
    async getBasePath(pathId:any) {
        var apiLoad = pathId.thingPath + '/basepath';
        await axios.get(apiLoad)
        .then((response) => {
            this.basePathId = response.data.CFET2CORE_SAMPLE_VAL;
        })
    }
    async getSamplerate(pathId:any) {
        var apiLoad = pathId.thingPath + '/samplerate/' + pathId.path;
        await axios.get(apiLoad)
        .then((response) => {
            this.sampleId = response.data.CFET2CORE_SAMPLE_VAL;
        })
    }
    async getLength(pathId:any) {
        var apiLoad = pathId.thingPath + '/length/' + pathId.path;
        await axios.get(apiLoad)
        .then((response) => {
            this.lengthId = response.data.CFET2CORE_SAMPLE_VAL;
        })
    }
}
</script>