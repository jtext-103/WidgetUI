<template id="setBasicParams">
<div>
    <span>parent and children link</span>
    <b-button variant="primary" @click="getPath">show</b-button>  
    <div style="margin-top:10px;height:80px;overflow:scroll" v-show="isShow">
        <a :href="parentPath" style="float:left">parentPath:{{ parentPath }}</a>
        <div v-for="(path,index) in childrenPath" :key="index">
            <a :href= "path" style="float:left">childrenPath:{{path}}</a><br>
        </div>
    </div>
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

@Component({
    components:{
        WidgetParams
    }
})
export default class Navigation extends Vue {
    @Prop() url!:string;
    parentPath!:string;
    childrenPath!:string[];
    isShow:boolean = false;

    async getPath(){
        var apiLoad = this.url;
        await axios.get(apiLoad)
        .then(response => {
            this.parentPath = response.data.ParentPath as string;
            this.childrenPath = response.data.ChildrenPath as string[];
        })
        this.isShow = true;
        this.$forceUpdate();
    }

}
</script>
<style scoped>
</style>