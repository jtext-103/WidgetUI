import { Vue } from 'vue-property-decorator';
import { WidgetConfig } from './WidgetConfig';
import { UpdatePayload } from './UpdatePayload';
import { ResourceInfo } from './Customview';

export interface PokePath {
  getPath: string;
  setPath: string;
  invokePath: string;
}

export abstract class Widget extends Vue {
  public WidgetComponentName?: string;
  public abstract setConfig(wid: WidgetConfig): void;
  public abstract getConfig(): WidgetConfig;
  public abstract parentUpdate(payload: UpdatePayload): void;
  public abstract refresh(): void;
  public abstract updateUI(): void;
  public abstract replaceStartPath(startPath:string):void;
  public abstract pathPoke():void;
  public abstract samplePoke(sample:any):void;
}






