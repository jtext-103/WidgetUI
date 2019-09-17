<template>
    <div class="panel-heading">
        <h2 class="panel-title">
            <font>
                Basic Path :&nbsp;
            </font>
            <font color="RoyalBlue" id="basePathId">{{ basePathId }}</font>
            &nbsp;&nbsp;
            <font id="sampleId">sample Rate: {{ sampleId }}</font>
            &nbsp;&nbsp;
            <font id="lengthId">length: {{ lengthId }}</font>
        </h2>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import axios from 'axios';
import global_ from '@/components/Common/global.vue';

@Component
export default class showViewInfo extends Vue {
    @Prop() pathId!:string;
    basePathId: string = '';
    sampleId: string = '';
    lengthId: string = '';
    @Watch('pathId')
    onPathIdChanged(val:string, oldVal:string) {
        this.show(val);
    }
    async show(pathId:string) {
        this.getBasePath();
        this.getSamplerate(pathId);
        this.getLength(pathId);
    }
    async getBasePath() {
        var apiLoad = global_.thingPath + '/basepath';
        await axios.get(apiLoad)
        .then((response) => {
            this.basePathId = response.data.ObjectVal;
        })
    }
    async getSamplerate(pathId:string) {
        var apiLoad = global_.thingPath + '/samplerate/' + pathId;
        await axios.get(apiLoad)
        .then((response) => {
            this.sampleId = response.data.ObjectVal;
        })
    }
    async getLength(pathId:string) {
        var apiLoad = global_.thingPath + '/length/' + pathId;
        await axios.get(apiLoad)
        .then((response) => {
            this.lengthId = response.data.ObjectVal;
        })
    }
}
</script>