import {Observable} from 'rxjs';

export type TrapEvent = {
  type: string;
  path: string[];
  id: number;
};

export type TransactionEvent = TrapEvent & {
  name: string;
  events: TrapEvent[];
};

export type StaleEvent = TrapEvent & {
  cache: any;
};

export type ModelObj = {
  [key: string]: any;
};

export type ProxyObj = ModelObj & {
  $: Observable<TrapEvent>;
  set$: Observable<TrapEvent>;
  delete$: Observable<TrapEvent>;
  get$: Observable<TrapEvent>;
  has$: Observable<TrapEvent>;
  keys$: Observable<TrapEvent>;
  compute_begin$: Observable<TrapEvent>;
  compute_finish$: Observable<TrapEvent>;
  stale$: Observable<StaleEvent>;
  transaction$: Observable<TransactionEvent>;
};
