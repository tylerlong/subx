import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'
import * as R from 'ramda'

const RESERVED_PROPERTIES = ['$', 'get$', 'set$', 'delete$', '$$', 'get$$', 'set$$', 'delete$$']

const handler = {
  set: (target, prop, val, receiver) => {
    if (prop === '$' || prop === '$$') {
      return false // disallow overriding $ or $$
    }
    if (prop.startsWith('__') && prop.endsWith('__')) {
      target[prop] = val
      return true
    }
    const oldVal = target[prop]
    let subscription
    if (typeof val === 'object' && val !== null) {
      let proxy
      if (val.__isSubX__) {
        proxy = val
      } else {
        proxy = SubX.create(val) // for recursive
      }
      subscription = proxy.$$.subscribe(event => receiver.$$.next(R.assoc('path', [prop, ...event.path], event)))
      target[prop] = proxy
    } else {
      target[prop] = val
    }
    target.$.next({ type: 'SET', prop, val, oldVal })
    if (subscription) {
      // todo: unsub the current one
      target.$.pipe(filter(event => event.prop === prop)).subscribe(event => {
        subscription.unsubscribe()
      })
    }
    return true
  },
  get: (target, prop, receiver) => {
    switch (prop) {
      case '__isSubX__':
        return true
      case 'toJSON':
        return () => R.pipe(R.dissoc('$'), R.dissoc('$$'))(target)
      case 'toString':
        return () => `SubX ${JSON.stringify(receiver, null, 2)}`
      case 'inspect':
        return () => receiver.toString()
      default:
        return target[prop]
    }
  },
  deleteProperty (target, prop) {
    if (prop === '$' || prop === '$$') {
      return false // disallow deletion of $ or $$
    }
    const val = target[prop]
    delete target[prop]
    target.$.next({ type: 'DELETE', prop, val })
    return true
  },
  ownKeys (target) {
    return R.without(RESERVED_PROPERTIES, Object.getOwnPropertyNames(target))
  }
}

class SubX {
  constructor (modelObj = {}) {
    class Model {
      constructor (obj = {}) {
        const emptyValue = R.empty(obj)
        emptyValue.$ = new Subject()
        emptyValue.$$ = new Subject()
        const proxy = new Proxy(emptyValue, handler)
        R.pipe(
          R.concat,
          R.reject(([prop, val]) => prop === '$' || prop === '$$'),
          R.forEach(([prop, val]) => { proxy[prop] = val })
        )(R.toPairs(modelObj), R.toPairs(obj))
        proxy.$.subscribe(event => proxy.$$.next(R.pipe(R.assoc('path', [event.prop]), R.dissoc('prop'))(event)))
        return proxy
      }
    }
    return Model
  }
}

const DefaultModel = new SubX({})
SubX.create = (obj = {}) => new DefaultModel(obj)

export default SubX
