import { Subject, merge } from 'rxjs'
import { filter } from 'rxjs/operators'
import * as R from 'ramda'
import util from 'util'
import uuid from 'uuid/v4'

import computed from './computed'
import { runAndMonitor, autoRun } from './monitor'

const RESERVED_PROPERTIES = [
  '$', 'set$', 'delete$', 'get$', 'has$', 'keys$', 'compute_begin$', 'compute_finish$', 'stale$'
]

const handler = {
  set: (target, prop, val, receiver) => {
    if (R.contains(prop, RESERVED_PROPERTIES)) {
      prop = `_${prop}` // prefix reserved keywords with underscore
    }
    const oldVal = target[prop]
    let subscriptions = []
    if (typeof val === 'object' && val !== null) {
      let proxy
      if (val.__isSubX__) { // p.b = p.a
        proxy = val
      } else {
        proxy = SubX.create(val) // for recursive
      }
      subscriptions.push(proxy.set$.subscribe(event => target.set$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.delete$.subscribe(event => target.delete$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.get$.subscribe(event => target.get$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.has$.subscribe(event => target.has$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.keys$.subscribe(event => target.keys$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.compute_begin$.subscribe(event => target.compute_begin$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.compute_finish$.subscribe(event => target.compute_finish$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.stale$.subscribe(event => target.stale$.next(R.assoc('path', [prop, ...event.path], event))))
      target[prop] = proxy
    } else {
      target[prop] = val
    }
    target.set$.next({ type: 'SET', path: [prop], val, oldVal, id: uuid() })
    if (subscriptions.length > 0) {
      const temp = target.$.pipe(filter(event => event.path.length === 1 && event.path[0] === prop)).subscribe(event => {
        R.forEach(subscription => subscription.unsubscribe(), subscriptions)
        temp.unsubscribe()
      })
    }
    return true
  },
  get: (target, prop, receiver) => {
    if (!R.contains(prop, RESERVED_PROPERTIES)) {
      target.get$.next({ type: 'GET', path: [prop], id: uuid() })
    }
    switch (prop) {
      case '__isSubX__':
        return true
      case 'toJSON':
        return () => Array.isArray(target) ? receiver : R.reduce((t, k) => R.dissoc(k, t), receiver, RESERVED_PROPERTIES)
      case 'toString':
        return () => '[object SubX]'
      case util.inspect.custom:
        return () => Array.isArray(target) ? receiver
          : R.pipe(
            R.keys,
            R.reject(k => R.contains(k, RESERVED_PROPERTIES)),
            R.reduce((obj, k) => Object.defineProperty(obj, k, Object.getOwnPropertyDescriptor(receiver, k)))({})
          )(receiver)
      default:
        return target[prop]
    }
  },
  deleteProperty: (target, prop) => {
    if (R.contains(prop, RESERVED_PROPERTIES)) {
      return false // disallow deletion of reserved keywords
    }
    const val = target[prop]
    delete target[prop]
    target.delete$.next({ type: 'DELETE', path: [prop], val, id: uuid() })
    return true
  },
  has: (target, prop) => {
    const val = prop in target
    target.has$.next({ type: 'HAS', path: [prop], val, id: uuid() })
    return val
  },
  ownKeys: target => {
    const val = R.without(RESERVED_PROPERTIES, Object.getOwnPropertyNames(target))
    target.keys$.next({ type: 'KEYS', path: [], val, id: uuid() })
    return val
  },
  setPrototypeOf: (target, prototype) => {
    return false // disallow setPrototypeOf
  },
  defineProperty: (target, property, descriptor) => {
    return false // disallow defineProperty
  },
  preventExtensions: target => {
    return false // disallow preventExtensions
  }
}

class SubX {
  constructor (modelObj = {}) {
    class Model {
      constructor (obj = {}) {
        const newObj = R.empty(obj)

        newObj.set$ = new Subject()
        newObj.delete$ = new Subject()
        newObj.get$ = new Subject()
        newObj.has$ = new Subject()
        newObj.keys$ = new Subject()
        newObj.compute_begin$ = new Subject()
        newObj.compute_finish$ = new Subject()
        newObj.stale$ = new Subject()
        newObj.$ = merge(newObj.set$, newObj.delete$)

        const proxy = new Proxy(newObj, handler)
        R.pipe(
          R.concat,
          R.forEach(([target, prop]) => {
            const descriptor = Object.getOwnPropertyDescriptor(target, prop)
            if ('value' in descriptor) {
              proxy[prop] = target[prop]
            } else if ('get' in descriptor && descriptor.set === undefined) { // getter function
              descriptor.get = computed(proxy, descriptor.get)
              Object.defineProperty(newObj, prop, descriptor)
            }
          })
        )(R.map(key => [modelObj, key], R.keys(modelObj)), R.map(key => [obj, key], R.keys(obj)))
        return proxy
      }
    }
    return Model
  }
}

const DefaultModel = new SubX({})
SubX.create = (obj = {}) => new DefaultModel(obj)

SubX.runAndMonitor = runAndMonitor
SubX.autoRun = autoRun
export default SubX
