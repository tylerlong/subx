import {
  Subject,
  Observable,
  MonoTypeOperatorFunction,
  BehaviorSubject,
} from 'rxjs';
import * as R from 'ramda';

import {computed, runAndMonitor, autoRun} from './monitor';
import uuid from './uuid';
import {ProxyObj, TrapEvent, ModelObj} from './types';

const EVENT_NAMES = [
  'set$',
  'delete$',
  'get$',
  'has$',
  'keys$',
  'compute_begin$',
  'compute_finish$',
  'stale$',
  'transaction$',
];
const RESERVED_PROPERTIES = [
  '$',
  '__isSubX__',
  '__id__',
  '__recursive__',
  '__emitEvent__',
  '__parents__',
  '__cache__',
  '@@functional/placeholder',
  ...EVENT_NAMES,
];

const handler = {
  set: (target: ModelObj, prop: string, val: any, receiver: ProxyObj) => {
    if (RESERVED_PROPERTIES.includes(prop)) {
      prop = `_${prop}`; // prefix reserved keywords with underscore
    }
    const oldVal = target[prop];
    if (val === null || typeof val !== 'object') {
      // simple value such as integer
      target[prop] = val;
      target.__emitEvent__('set$', {type: 'SET', path: [prop], id: uuid()});
      return true;
    }
    const proxy = val.__isSubX__
      ? val
      : target.__recursive__
      ? SubX.create(val)
      : val;
    target[prop] = proxy;
    if (proxy.__isSubX__) {
      proxy.__parents__[target.__id__ + ':' + prop] = [target, prop];
    }
    if (oldVal && oldVal.__isSubX__) {
      delete oldVal.__parents__[target.__id__ + ':' + prop];
    }

    target.__emitEvent__('set$', {type: 'SET', path: [prop], id: uuid()});
    return true;
  },
  get: (target: ModelObj, prop: string, receiver: ProxyObj) => {
    switch (prop) {
      case '__isSubX__':
        return true;
      case 'toJSON':
        return () =>
          Array.isArray(target)
            ? receiver
            : R.fromPairs(
                Object.keys(receiver)
                  .filter(
                    k =>
                      !RESERVED_PROPERTIES.includes(k) &&
                      'value' in
                        Object.getOwnPropertyDescriptor(receiver, k)! &&
                      typeof receiver[k] !== 'function'
                  )
                  .map(k => [k, receiver[k]])
              );
      case 'toObject':
        return () => JSON.parse(JSON.stringify(receiver));
      case 'toString':
        return () => '[object SubX]';
      case 'startTransaction':
        return () => {
          target.__cache__ = [];
        };
      case 'endTransaction':
        return (name: string) => {
          const event = {
            type: 'TRANSACTION',
            name,
            path: [],
            events: target.__cache__,
            id: uuid(),
          };
          delete target.__cache__;
          if (name) {
            event.name = name;
          }
          target.__emitEvent__('transaction$', event);
        };
      case 'copyWithin': // https://www.w3schools.com/jsref/jsref_obj_array.asp
      case 'fill':
      case 'pop':
      case 'push':
      case 'reverse':
      case 'shift':
      case 'sort':
      case 'splice':
      case 'unshift':
        if (Array.isArray(target)) {
          const f = (...args: any[]) => {
            receiver.startTransaction();
            const r = (target[prop].bind(receiver) as any)(...args);
            receiver.endTransaction(prop);
            return r;
          };
          return f;
        }
        return target[prop];
      default: {
        const val = target[prop];
        if (
          typeof val !== 'function' &&
          !RESERVED_PROPERTIES.includes(prop) &&
          typeof prop !== 'symbol'
        ) {
          target.__emitEvent__('get$', {type: 'GET', path: [prop], id: uuid()});
        }
        return val;
      }
    }
  },
  deleteProperty: (target: ModelObj, prop: string) => {
    if (RESERVED_PROPERTIES.includes(prop)) {
      return false; // disallow deletion of reserved keywords
    }
    const val = target[prop];
    delete target[prop];

    if (val && val.__isSubX__) {
      delete val.__parents__[target.__id__ + ':' + prop];
    }

    target.__emitEvent__('delete$', {type: 'DELETE', path: [prop], id: uuid()});
    return true;
  },
  has: (target: ModelObj, prop: string) => {
    if (typeof prop !== 'symbol') {
      target.__emitEvent__('has$', {type: 'HAS', path: [prop], id: uuid()});
    }
    return prop in target;
  },
  ownKeys: (target: ModelObj) => {
    target.__emitEvent__('keys$', {type: 'KEYS', path: [], id: uuid()});
    return R.without(RESERVED_PROPERTIES, Object.getOwnPropertyNames(target));
  },
  setPrototypeOf: (target: ModelObj, prototype: ModelObj) => {
    return false; // disallow setPrototypeOf
  },
  defineProperty: (
    target: ModelObj,
    property: string,
    descriptor: ModelObj
  ) => {
    return false; // disallow defineProperty
  },
  preventExtensions: (target: ModelObj) => {
    return false; // disallow preventExtensions
  },
};

class SubX {
  static create: (obj?: ModelObj, recursive?: boolean) => ProxyObj;
  static runAndMonitor: (
    subx: ProxyObj,
    f: () => any
  ) => {result: any; stream$: Observable<TrapEvent>};
  static autoRun: (
    subx: ProxyObj,
    f: () => any,
    ...operators: MonoTypeOperatorFunction<TrapEvent>[]
  ) => BehaviorSubject<any>;
  static model(modelObj: ModelObj = {}, recursive = true) {
    const Model = {
      create(obj: ModelObj = {}, __recursive__ = recursive): ProxyObj {
        const newObj: ModelObj = R.empty(obj);
        R.forEach(name => {
          newObj[name] = new Subject();
        }, EVENT_NAMES);
        newObj.$ = newObj.set$;

        newObj.__id__ = uuid();
        newObj.__recursive__ = __recursive__;
        newObj.__parents__ = {};
        newObj.__emitEvent__ = (name: string, event: TrapEvent) => {
          if (newObj.__cache__) {
            if (event.type === 'SET' || event.type === 'DELETE') {
              // may need to include 'STALE' events for user-defined transactions in the future
              newObj.__cache__.push(event);
            }
            return;
          }
          if (newObj[name].observers.length > 0) {
            newObj[name].next(event);
          }
          Object.keys(newObj.__parents__).forEach(k => {
            const [parent, prop] = newObj.__parents__[k];
            parent.__emitEvent__(
              name,
              R.assoc('path', [prop, ...event.path], event)
            );
          });
        };

        const proxy = new Proxy(newObj, handler) as ProxyObj;

        for (const {target, prop} of [
          ...Object.keys(modelObj).map(key => ({target: modelObj, prop: key})),
          ...Object.keys(obj).map(key => ({target: obj, prop: key})),
        ]) {
          const descriptor = Object.getOwnPropertyDescriptor(target, prop)!;
          if ('value' in descriptor) {
            proxy[prop] = target[prop];
          } else if ('get' in descriptor) {
            // getter function
            descriptor.get = computed(proxy, descriptor.get!);
            Object.defineProperty(newObj, prop, descriptor);
          }
        }
        return proxy;
      },
    };
    return Model;
  }
}

const DefaultModel = SubX.model({});
SubX.create = (obj = {}, recursive = true) =>
  DefaultModel.create(obj, recursive);
SubX.runAndMonitor = runAndMonitor;
SubX.autoRun = autoRun;

export default SubX;