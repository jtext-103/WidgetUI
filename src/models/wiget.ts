import { Vue } from 'vue-property-decorator';
import { WidgetConfig } from './WidgetConfig';
import { UpdatePayload } from './UpdatePayload';

export interface PokePath {
  getPath: string;
  setPath: string;
  invokePath: string;
}

export abstract class Widget extends Vue {
  public WidgetComponentName?: string;
  public abstract setConfig(wid: WidgetConfig): void;
  public abstract getConfig(): WidgetConfig;
  public abstract parentUpdate(paylosd: UpdatePayload): void;
  public abstract refresh(): void;
  public abstract updateUI(): void;
  public abstract replaceStartPath(startPath:string):void;

  public pathPoke()
  {

  }

  public samplePoke()
  {

  }

//   public poke(sample: object): PokePath
//   {
//     let pokePath:PokePath;
//     return pokePath;
//   }
}






