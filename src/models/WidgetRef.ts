import { WidgetConfig } from './WidgetConfig';

export class WidgetRef {
  // this is not quite right, the config for a resource should only be visual-wise,
  // the parameters of a resource should be probed by the widget itself
  public widgetComponentName: string = '';
  public ref: string = '';
  public widgetConfig?: WidgetConfig;
  //below is for grid layout
  public x:number=0;
  public y:number=0;
  public w:number=8;
  public h:number=6;
  public i:number=0;
}
