import { WidgetRef } from './WidgetRef';
export interface WidgetConfig {
  WidgetComponentName: string;
  data: any;
}

export class AllWidgetConfig {
  public currentRef?: string;
  public widgetList: WidgetRef[] = [];
}


