<template>
    <div class="largeFont" style="float:left width:100%">
        <span>Basic Path :&nbsp;{{ basePathId }}</span><br>
        <span> Rate: {{ sampleId }}</span><br>
        <span>length: {{ lengthId }}</span><br>
        <hr />
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