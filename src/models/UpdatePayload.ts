import * as Collections from "typescript-collections";

export enum Action {
  Get,
  Set,
  Invoke,
  Broadcast,
  BroadcastAndRefresh
}
export interface UpdatePayload {
  target: string[];
  action: string;
  variables: Map<string, string>;
}

export interface ParamRef {
  paramName:string;
  value: string;
  ref: string;
}
