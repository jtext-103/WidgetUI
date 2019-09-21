<template id="setBasicParams">
<div>
    <b-dropdown id="dropdown-1" text="Navigation" variant="primary">
        <b-dropdown-item v-show="isShowParentPath">
            <a class="smallFont" :href="parentPath" style="float:left">parentPath:{{ parentPath }}</a>
        </b-dropdown-item>
        <b-dropdown-item v-for="path in childrenPath" :key="path">
          <a class="smallFont" :href= "path" style="float:left">childrenPath:{{path}}</a><br>
        </b-dropdown-item>
    </b-dropdown>  
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
    isShowParentPath:boolean = false;

    @Watch("url")
    onUrlChanged(){
        this.getPath();
    }
    async getPath(){
        this.isShowParentPath = false;
        var apiLoad = this.url;
        await axios.get(apiLoad)
        .then(response => {
            this.parentPath = response.data.ParentPath as string;
            this.childrenPath = response.data.ChildrenPath as string[];
        })
        if(this.parentPath != ''){
            this.isShowParentPath = true;
        }
        this.$forceUpdate();
    }

}
</script>
<style scoped>
</style>