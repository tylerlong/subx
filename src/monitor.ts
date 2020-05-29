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
import {Obj, Event} from './types';
import {pipeFromArray} from 'rxjs/internal/util/pipe';

const matchFilters = {
  get: (subx: Obj, get: Event) => {
    const val = R.path(get.path, subx);
    return (event: Event) => {
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
        const parentVal = R.path<Obj>(R.init(get.path), subx);
        if (typeof parentVal === 'object' && parentVal !== null) {
          return val !== parentVal[R.last(get.path)!];
        }
      }
      return false;
    };
  },
  has: (subx: Obj, has: Event) => {
    const val = R.last(has.path)! in R.path<Obj>(R.init(has.path), subx)!;
    return (event: Event) => {
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
  keys: (subx: Obj, keys: Event) => {
    const val = Object.keys(R.path<Obj>(keys.path, subx)!);
    return (event: Event) => {
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

const monitorGets = (subx: Obj, gets: Event[]) => {
  const uniqGets = R.uniqBy((event: Event) => event.path.join('.'), gets);
  const streams: Observable<Event>[] = [];
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

const monitorHass = (subx: Obj, hass: Event[]) => {
  const uniqHass = R.uniqBy((has: Event) => has.path.join('.'), hass);
  const streams: Observable<Event>[] = [];
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

const monitorkeyss = (subx: Obj, keyss: Event[]) => {
  const uniqKeyss = R.uniqBy((keys: Event) => keys.path.join('.'), keyss);
  const streams: Observable<Event>[] = [];
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
export const removeDuplicateEvents = (events: Event[]) =>
  R.reduce((result: Event[], event: Event) => {
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
  subx: Obj,
  {gets, hass, keyss}: {gets: Event[]; hass: Event[]; keyss: Event[]}
) => {
  return merge(
    ...monitorGets(subx, removeDuplicateEvents(gets)),
    ...monitorHass(subx, removeDuplicateEvents(hass)),
    ...monitorkeyss(subx, removeDuplicateEvents(keyss))
  ).pipe(distinct(), publish(), refCount());
  // .refCount();
};

export const runAndMonitor = (subx: Obj, f: () => any) => {
  const gets: Event[] = [];
  const hass: Event[] = [];
  const keyss: Event[] = [];
  let count = 0;
  const subscription = new Subscription();
  subscription.add(
    subx.get$.subscribe((event: Event) => count === 1 && gets.push(event))
  );
  subscription.add(
    subx.has$.subscribe((event: Event) => count === 1 && hass.push(event))
  );
  subscription.add(
    subx.keys$.subscribe((event: Event) => count === 1 && keyss.push(event))
  );
  subscription.add(
    subx.compute_begin$.subscribe((event: Event) => {
      count += 1;
    })
  );
  subscription.add(
    subx.compute_finish$.subscribe((event: Event) => {
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

export const computed = (subx: Obj, f: () => any) => {
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
      stream$.pipe(take(1)).subscribe((event: Event) => {
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
  subx: Obj,
  f: () => any,
  ...operators: MonoTypeOperatorFunction<Event>[]
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
      .subscribe((event: Event) => run());
  };
  run();
  results$!.subscribe(undefined, undefined, () => {
    // complete
    subscription.unsubscribe();
  });
  return results$!;
};
