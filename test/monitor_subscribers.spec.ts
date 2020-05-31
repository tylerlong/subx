/* eslint-env jest */
import {Subject, from, fromEvent, Subscription, Observer} from 'rxjs';
import {map} from 'rxjs/operators';
import {EventEmitter} from 'events';
import {ModelObj} from '../src/types';

describe('monitor subscribers', () => {
  test('default', () => {
    const s = new Subject();
    expect(s.observers.length).toBe(0);
    s.subscribe(e => {});
    expect(s.observers.length).toBe(1);
    s.pipe(map(e => e)).subscribe(e => {});
    expect(s.observers.length).toBe(2);
    const temp$ = s.pipe(map(e => e));
    temp$.subscribe(e => {});
    expect(s.observers.length).toBe(3);
  });

  test('get & set observers', () => {
    const s = new Subject();
    expect(s.observers).toEqual([]);
    const observers: Observer<unknown>[] = [];
    s.observers = observers;
    s.subscribe(e => {});
    expect(s.observers.length).toBe(1);
    expect(observers.length).toBe(1);
  });

  test('observable observers', () => {
    const o = from([1, 2, 3]);
    expect((o as any).observers).toBeUndefined();
  });

  test('fromEvent observers', () => {
    const emitter = new EventEmitter();
    const o = fromEvent(emitter, 'msg');
    expect((o as any).observers).toBeUndefined();
  });

  test('monitor observers', () => {
    const s = new Subject();
    let add = 0;
    let remove = 0;
    s.observers = new Proxy([], {
      set: (target: ModelObj, prop: string, val: any, receiver: ModelObj) => {
        if (prop === 'length') {
          if (val === target[prop]) {
            add += 1;
          } else {
            remove += 1;
          }
        }
        target[prop] = val;
        return true;
      },
    }) as any;
    const subscription = new Subscription();
    expect(add).toBe(0);
    expect(remove).toBe(0);
    subscription.add(s.subscribe(e => {}));
    expect(add).toBe(1);
    expect(remove).toBe(0);
    subscription.add(s.subscribe(e => {}));
    expect(add).toBe(2);
    expect(remove).toBe(0);
    subscription.unsubscribe();
    expect(add).toBe(2);
    expect(remove).toBe(2);
  });

  test('observers stream', () => {
    const s = new Subject();
    s.observers = new Proxy([], {
      get: (target: ModelObj, prop: string, receiver) => {
        if (prop === '$' && !target.$) {
          target.$ = new Subject();
        }
        return target[prop];
      },
      set: (target, prop: string, val, receiver) => {
        if (target.$ && prop === 'length') {
          if (val === 0) {
            target.$.next(false); // no observers
          } else if (val === 1 && val === target[prop]) {
            target.$.next(true); // first observer
          }
        }
        target[prop] = val;
        return true;
      },
    }) as any;

    const events: boolean[] = [];
    (s.observers as any).$.subscribe((e: boolean) => events.push(e));
    expect(events).toEqual([]);
    const subscription = s.subscribe(e => {});
    expect(events).toEqual([true]);
    subscription.unsubscribe();
    expect(events).toEqual([true, false]);
  });
});
