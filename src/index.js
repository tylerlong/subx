import { Subject, merge, Subscription } from 'rxjs'
import { first, takeUntil, filter, startWith, publish } from 'rxjs/operators'
import * as R from 'ramda'
import util from 'util'
import uuid from 'uuid/v4'

import { computed, runAndMonitor, autoRun } from './monitor'

const EVENT_NAMES = ['set$', 'delete$', 'get$', 'has$', 'keys$', 'compute_begin$', 'compute_finish$', 'stale$']
const RESERVED_PROPERTIES = ['$', '__subscription__', ...EVENT_NAMES]

const handler = {
  set: (target, prop, val, receiver) => {
    if (prop === '__subscription__') {
      target[prop] = val
      return true
    }
    if (R.contains(prop, RESERVED_PROPERTIES)) {
      prop = `_${prop}` // prefix reserved keywords with underscore
    }
    const oldVal = target[prop]
    if (val === null || typeof val !== 'object') { // simple value such as integer
      target[prop] = val
      target.set$.next({ type: 'SET', path: [prop], val, oldVal, id: uuid() })
      return true
    }
    const proxy = val.__isSubX__ ? val : SubX.create(val)
    const id = uuid()

    if (!proxy.__subscription__) {
      proxy.__subscription__ = new Subscription()
    }
    // target.detach$.pipe(first(event => event.id !== id && event.path[0] === prop)).subscribe(e => subscription.unsubscribe()) // prop detached from obj
    R.forEach(name => { // pass prop event to obj
      proxy.__subscription__.add(target[name].observers.$.pipe(startWith(target[name].observers.length > 0), filter(e => e)).subscribe(e => {
        const stopBubble$ = target[name].observers.$.pipe(first(e => !e))
        proxy.__subscription__.add(proxy[name].pipe(takeUntil(stopBubble$)).subscribe(event => target[name].next(R.assoc('path', [prop, ...event.path], event))))
      }))
    }, EVENT_NAMES)

    if (oldVal && oldVal.__isSubX__ && oldVal.__subscription__) {
      oldVal.__subscription__.unsubscribe()
    }
    target[prop] = proxy
    const data = { type: 'SET', path: [prop], val, oldVal, id }
    target.set$.next(data)
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
    if (val && val.__isSubX__ && val.__subscription__) {
      val.__subscription__.unsubscribe()
    }
    delete target[prop]
    const data = { type: 'DELETE', path: [prop], val, id: uuid() }
    target.delete$.next(data)

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

const observersHandler = {
  get: (target, prop, receiver) => {
    if (prop === '$' && !target.$) {
      target.$ = new Subject()
    }
    return target[prop]
  },
  set: (target, prop, val, receiver) => {
    if (target.$ && prop === 'length') {
      if (val === 0 && val !== target[prop]) { // 1 observers in used internally as `detach$`
        target.$.next(false) // no observers
      } else if (val === 1 && val === target[prop]) {
        target.$.next(true) // first observer
      }
    }
    target[prop] = val
    return true
  }
}

class SubX {
  constructor (modelObj = {}) {
    class Model {
      constructor (obj = {}) {
        const newObj = R.empty(obj)
        R.forEach(name => {
          const subject = new Subject()
          subject.observers = new Proxy([], observersHandler)
          newObj[name] = subject
        }, EVENT_NAMES)
        // newObj.detach$ = new Subject()
        newObj.$ = merge(newObj.set$, newObj.delete$).pipe(publish()).refCount()
        const proxy = new Proxy(newObj, handler)
        R.pipe(
          R.concat(R.map(key => [modelObj, key], R.keys(modelObj))),
          R.forEach(([target, prop]) => {
            const descriptor = Object.getOwnPropertyDescriptor(target, prop)
            if ('value' in descriptor) {
              proxy[prop] = target[prop]
            } else if ('get' in descriptor) { // getter function
              descriptor.get = computed(proxy, descriptor.get)
              Object.defineProperty(newObj, prop, descriptor)
            }
          })
        )(R.map(key => [obj, key], R.keys(obj)))
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
