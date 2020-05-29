import {Observable} from 'rxjs';

export type Event = {
  type: string;
  path: string[];
  id: number;
};

export type TransactionEvent = Event & {
  name: string;
  events: Event[];
};

export type StaleEvent = Event & {
  cache: any;
};

export type ModelObj = {
  [key: string]: any;
};

export type ProxyObj = ModelObj & {
  $: Observable<Event>;
  set$: Observable<Event>;
  delete$: Observable<Event>;
  get$: Observable<Event>;
  has$: Observable<Event>;
  keys$: Observable<Event>;
  compute_begin$: Observable<Event>;
  compute_finish$: Observable<Event>;
  stale$: Observable<StaleEvent>;
  transaction$: Observable<TransactionEvent>;
};
