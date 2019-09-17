import { WidgetRef } from './WidgetRef';
import {  GridItemData } from 'vue-grid-layout';
export interface WidgetConfig {
  WidgetComponentName: string;
  data: any;
}

export class AllWidgetConfig {
  public currentRef?: string;
  public widgetList: WidgetRef[] = [];
}


