import {Observable} from 'rxjs';

export type HandlerEvent = {
  type: string;
  path: string[];
  id: number;
};

export type ComputeEvent = HandlerEvent;

export type TransactionEvent = HandlerEvent & {
  name: string;
  events: HandlerEvent[];
};

export type StaleEvent = HandlerEvent & {
  cache: any;
};

export type ModelObj = {
  [key: string]: any;
};

export type ProxyObj<T = ModelObj> = T & {
  $: Observable<HandlerEvent>;
  set$: Observable<HandlerEvent>;
  delete$: Observable<HandlerEvent>;
  get$: Observable<HandlerEvent>;
  has$: Observable<HandlerEvent>;
  keys$: Observable<HandlerEvent>;
  compute_begin$: Observable<ComputeEvent>;
  compute_finish$: Observable<ComputeEvent>;
  stale$: Observable<StaleEvent>;
  transaction$: Observable<TransactionEvent>;
};
