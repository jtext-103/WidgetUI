export interface ResourceInfo {
  Parameters: any;
  OutputType: any;
}

export class Actions {
    public action?:{[key: string]: ResourceInfo};
  }