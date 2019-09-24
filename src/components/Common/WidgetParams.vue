<template>
  <div style="width:100%">
    <div v-for="(label, index) in userInputData.keys()" :key="index">
      <b-input-group size="lg" style="margin:5px">
        <b-input-group-text class="smallFont">{{label}}</b-input-group-text>
        <b-form-input v-model="tempUserInputData[label]" ></b-form-input>
      </b-input-group>
    </div>
    <div style="width:100%;margin:5px">
      <b-button variant="primary"  size="lg" @click="update" style="float:right">
        <b>{{ action }}</b>
        <span class="glyphicon glyphicon-save"></span>
      </b-button>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import { UpdatePayload } from '../../models/UpdatePayload';
import { values, keys } from 'd3';
import { forEach } from "typescript-collections/dist/lib/arrays";

@Component
export default class WidgetParams extends Vue{
    @Prop() action!: string;  

    userInputData= new Map<string, string>();
    tempUserInputData:{[key: string]: string} = {};

    setVariableList(path: string[]) {
        this.userInputData.clear();
        path.forEach(element => {
            this.userInputData.set(element, '');
        });
        this.$forceUpdate();
    }

    setVariableInput(parentUserInputData:Map<string, string>)
    {
       for (var key of parentUserInputData.keys()) {
             this.tempUserInputData[key] = parentUserInputData.get(key) as string;
        }
    }

    getVariableValues(): Map<string, string> {
        for(var key of this.userInputData.keys()) {
            this.userInputData.set(key, this.tempUserInputData[key]);
        }
        return this.userInputData;
    }
    update(){
        var Args:UpdatePayload = {
            action: this.action,
            variables: this.getVariableValues(),
            target:['self']
        }
        this.$emit('updataVariables', Args)
    }
}
</script>
