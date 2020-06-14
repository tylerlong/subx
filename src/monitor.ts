import {
  merge,
  BehaviorSubject,
  Subscription,
  Observable,
  MonoTypeOperatorFunction,
} from 'rxjs';
import {filter, publish, distinct, take, refCount} from 'rxjs/operators';
import * as R from 'ramda';

import uuid from './uuid';
import {SubxObj, HandlerEvent} from './types';
import {pipeFromArray} from 'rxjs/internal/util/pipe';

const matchFilters = {
  get: (subx: SubxObj, get: HandlerEvent) => {
    const val = R.path(get.path, subx);
    return (event: HandlerEvent) => {
      if (event.type === 'STALE' && R.equals(event.path, get.path)) {
        return true;
      }
      if (
        event.type === 'DELETE' &&
        val !== undefined &&
        R.equals(event.path, get.path)
      ) {
        return true;
      }
      if (event.type === 'SET' && R.startsWith(event.path, get.path)) {
        const parentVal = R.path<SubxObj>(R.init(get.path), subx);
        if (typeof parentVal === 'object' && parentVal !== null) {
          return val !== parentVal[R.last(get.path)!];
        }
      }
      return false;
    };
  },
  has: (subx: SubxObj, has: HandlerEvent) => {
    const val = R.last(has.path)! in R.path<SubxObj>(R.init(has.path), subx)!;
    return (event: HandlerEvent) => {
      if (
        event.type === 'DELETE' &&
        val === true &&
        R.equals(event.path, has.path)
      ) {
        return true;
      }
      if (event.type === 'SET' && R.startsWith(event.path, has.path)) {
        const parentVal = R.path(R.init(has.path), subx);
        if (typeof parentVal === 'object' && parentVal !== null) {
          return R.last(has.path)! in parentVal !== val;
        }
      }
      return false;
    };
  },
  keys: (subx: SubxObj, keys: HandlerEvent) => {
    const val = Object.keys(R.path<SubxObj>(keys.path, subx)!);
    return (event: HandlerEvent) => {
      if (
        (event.type === 'DELETE' &&
          keys.path.length + 1 === event.path.length &&
          R.startsWith(keys.path, event.path)) ||
        (event.type === 'SET' &&
          (R.startsWith(event.path, keys.path) ||
            (keys.path.length + 1 === event.path.length &&
              R.startsWith(keys.path, event.path))))
      ) {
        const parentVal = R.path(keys.path, subx);
        if (typeof parentVal === 'object' && parentVal !== null) {
          return !R.equals(Object.keys(parentVal), val);
        }
      }
      return false;
    };
  },
};

const monitorGets = (subx: SubxObj, gets: HandlerEvent[]) => {
  const uniqGets = R.uniqBy(
    (event: HandlerEvent) => event.path.join('.'),
    gets
  );
  const streams: Observable<HandlerEvent>[] = [];
  R.forEach(get => {
    const getFilter = matchFilters.get(subx, get);
    streams.push(
      merge(subx.stale$, subx.delete$, subx.set$).pipe(
        filter(event => getFilter(event))
      )
    );
    streams.push(
      subx.transaction$.pipe(
        filter(e => {
          const events = e.events.map(ev =>
            R.assoc('path', [...e.path, ...ev.path], ev)
          );
          return events.some(event => getFilter(event));
        })
      )
    );
  }, uniqGets);
  return streams;
};

const monitorHass = (subx: SubxObj, hass: HandlerEvent[]) => {
  const uniqHass = R.uniqBy((has: HandlerEvent) => has.path.join('.'), hass);
  const streams: Observable<HandlerEvent>[] = [];
  R.forEach(has => {
    const hasFilter = matchFilters.has(subx, has);
    streams.push(
      merge(subx.delete$, subx.set$).pipe(filter(event => hasFilter(event)))
    );
    streams.push(
      subx.transaction$.pipe(
        filter(e => {
          const events = e.events.map(ev =>
            R.assoc('path', [...e.path, ...ev.path], ev)
          );
          return events.some(event => hasFilter(event));
        })
      )
    );
  }, uniqHass);
  return streams;
};

const monitorkeyss = (subx: SubxObj, keyss: HandlerEvent[]) => {
  const uniqKeyss = R.uniqBy(
    (keys: HandlerEvent) => keys.path.join('.'),
    keyss
  );
  const streams: Observable<HandlerEvent>[] = [];
  R.forEach(keys => {
    const keysFilter = matchFilters.keys(subx, keys);
    streams.push(
      merge(subx.delete$, subx.set$).pipe(filter(event => keysFilter(event)))
    );
    streams.push(
      subx.transaction$.pipe(
        filter(e => {
          const events = e.events.map(ev =>
            R.assoc('path', [...e.path, ...ev.path], ev)
          );
          return events.some(event => keysFilter(event));
        })
      )
    );
  }, uniqKeyss);
  return streams;
};

// a subx obj and one of its children attached to the same parent (props of React)
export const removeDuplicateEvents = (events: HandlerEvent[]) =>
  R.reduce((result: HandlerEvent[], event: HandlerEvent) => {
    if (result.length === 0) {
      return [event];
    }
    const last = R.last(result)!;
    if (event.id === last.id) {
      let longer;
      let shorter;
      if (event.path.length > last.path.length) {
        longer = event;
        shorter = last;
      } else {
        longer = last;
        shorter = event;
      }
      const lastLast =
        result.length > 1 ? R.last(R.init(result))! : {path: [undefined]};
      const correct = R.startsWith(lastLast.path, longer.path)
        ? longer
        : shorter;
      if (correct !== last) {
        return [...R.init(result), correct];
      }
      return result;
    }
    return R.append(event, result);
  })([], events);

const monitor = (
  subx: SubxObj,
  {
    gets,
    hass,
    keyss,
  }: {gets: HandlerEvent[]; hass: HandlerEvent[]; keyss: HandlerEvent[]}
) => {
  return merge(
    ...monitorGets(subx, removeDuplicateEvents(gets)),
    ...monitorHass(subx, removeDuplicateEvents(hass)),
    ...monitorkeyss(subx, removeDuplicateEvents(keyss))
  ).pipe(distinct(), publish(), refCount());
  // .refCount();
};

export const runAndMonitor = (subx: SubxObj, f: () => any) => {
  const gets: HandlerEvent[] = [];
  const hass: HandlerEvent[] = [];
  const keyss: HandlerEvent[] = [];
  let count = 0;
  const subscription = new Subscription();
  subscription.add(
    subx.get$.subscribe(
      (event: HandlerEvent) => count === 1 && gets.push(event)
    )
  );
  subscription.add(
    subx.has$.subscribe(
      (event: HandlerEvent) => count === 1 && hass.push(event)
    )
  );
  subscription.add(
    subx.keys$.subscribe(
      (event: HandlerEvent) => count === 1 && keyss.push(event)
    )
  );
  subscription.add(
    subx.compute_begin$.subscribe(() => {
      count += 1;
    })
  );
  subscription.add(
    subx.compute_finish$.subscribe(() => {
      count -= 1;
    })
  );
  count += 1;
  const result = f();
  count -= 1;
  subscription.unsubscribe();
  const stream$ = monitor(subx, {gets, hass, keyss});
  return {result, stream$};
};

export const computed = (subx: SubxObj, f: () => any) => {
  const functionName = R.last(f.name.split(' ')); // `get f` => `f`
  let cache: any;
  let stale = true;
  const wrapped = () => {
    if (stale) {
      subx.__emitEvent__('compute_begin$', {
        type: 'COMPUTE_BEGIN',
        path: [functionName],
        id: uuid(),
      });
      const {result, stream$} = runAndMonitor(subx, f.bind(subx));
      cache = result;
      stale = false;
      stream$.pipe(take(1)).subscribe(() => {
        stale = true;
        subx.__emitEvent__('stale$', {
          type: 'STALE',
          path: [functionName],
          cache,
          id: uuid(),
        });
      });
      subx.__emitEvent__('compute_finish$', {
        type: 'COMPUTE_FINISH',
        path: [functionName],
        id: uuid(),
      });
    }
    return cache;
  };
  return wrapped;
};

export const autoRun = (
  subx: SubxObj,
  f: () => any,
  ...operators: MonoTypeOperatorFunction<HandlerEvent>[]
) => {
  let results$: BehaviorSubject<any> | undefined;
  let subscription: Subscription;
  const run = () => {
    const {result, stream$} = runAndMonitor(subx, f);
    if (results$ === undefined) {
      results$ = new BehaviorSubject(result);
    } else {
      results$.next(result);
    }
    subscription = stream$
      .pipe(pipeFromArray(operators), take(1))
      .subscribe(() => run());
  };
  run();
  results$!.subscribe(undefined, undefined, () => {
    // complete
    subscription.unsubscribe();
  });
  return results$!;
};
