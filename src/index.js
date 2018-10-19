import { Subject, merge } from 'rxjs'
import * as R from 'ramda'
import util from 'util'
import uuid from 'uuid/v4'

import { computed, runAndMonitor, autoRun } from './monitor'

const EVENT_NAMES = ['set$', 'delete$', 'get$', 'has$', 'keys$', 'compute_begin$', 'compute_finish$', 'stale$']
const RESERVED_PROPERTIES = ['$', '__id__', '__emitEvent__', '__parents__', ...EVENT_NAMES]

const handler = {
  set: (target, prop, val, receiver) => {
    if (R.contains(prop, RESERVED_PROPERTIES)) {
      prop = `_${prop}` // prefix reserved keywords with underscore
    }
    const oldVal = target[prop]
    if (val === null || typeof val !== 'object') { // simple value such as integer
      target[prop] = val
      target.__emitEvent__('set$', { type: 'SET', path: [prop], val, oldVal, id: uuid() })
      return true
    }
    const proxy = val.__isSubX__ ? val : SubX.create(val)
    target[prop] = proxy

    proxy.__parents__.push([target, prop])
    if (oldVal && oldVal.__isSubX__) {
      const index = R.findIndex(parent => parent[0].__id__ === target.__id__, oldVal.__parents__)
      oldVal.__parents__.splice(index, 1)
    }

    target.__emitEvent__('set$', { type: 'SET', path: [prop], val, oldVal, id: uuid() })
    return true
  },
  get: (target, prop, receiver) => {
    if (!R.contains(prop, RESERVED_PROPERTIES)) {
      target.__emitEvent__('get$', { type: 'GET', path: [prop], id: uuid() })
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

    if (val && val.__isSubX__) {
      const index = R.findIndex(parent => parent[0].__id__ === target.__id__, val.__parents__)
      val.__parents__.splice(index, 1)
    }

    target.__emitEvent__('delete$', { type: 'DELETE', path: [prop], val, id: uuid() })
    return true
  },
  has: (target, prop) => {
    const val = prop in target
    target.__emitEvent__('has$', { type: 'HAS', path: [prop], val, id: uuid() })
    return val
  },
  ownKeys: target => {
    const val = R.without(RESERVED_PROPERTIES, Object.getOwnPropertyNames(target))
    target.__emitEvent__('keys$', { type: 'KEYS', path: [], val, id: uuid() })
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
        R.forEach(name => { newObj[name] = new Subject() }, EVENT_NAMES)
        newObj.$ = merge(newObj.set$, newObj.delete$)

        newObj.__id__ = uuid()
        newObj.__parents__ = []
        newObj.__emitEvent__ = (name, event) => {
          if (newObj[name].observers.length > 0) {
            newObj[name].next(event)
          }
          newObj.__parents__.forEach(([parent, prop]) => parent.__emitEvent__(name, R.assoc('path', [prop, ...event.path], event)))
        }

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
