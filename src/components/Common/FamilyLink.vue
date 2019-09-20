<template id="setBasicParams">
<div>
    <span>parent and children link</span>
    <b-button variant="primary" @click="getPath">show</b-button>  
    <div>
        <a :href="parentPath">{{ parentPath }}</a>
        <div v-for="(path,index) in childrenPath" :key="index">
            <a :href= "path" >{{path}}</a><br>
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
export default class FamilyLink extends Vue {
    @Prop() url!:string;
    parentPath!:string;
    childrenPath!:string[];

    async getPath(){
        var apiLoad = this.url;
        await axios.get(apiLoad)
        .then(response => {
            this.parentPath = response.data.ParentPath as string;
            this.childrenPath = response.data.ChildrenPath as string[];
        })
        this.$forceUpdate();
    }

}
</script>
<style scoped>
</style>