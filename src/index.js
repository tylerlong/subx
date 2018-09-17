import { Subject } from 'rxjs'
import * as R from 'ramda'

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
    if (oldVal && oldVal.__isSubX__) {
      oldVal.__subscription__.unsubscribe()
    }
    if (typeof val === 'object') {
      let proxy
      if (val.__isSubX__) {
        proxy = val
      } else {
        proxy = SubX.create(val) // for recursive
      }
      proxy.__subscription__ = proxy.$$.subscribe(action => receiver.$$.next(R.assoc('path', [prop, ...action.path], action)))
      target[prop] = proxy
    } else {
      target[prop] = val
    }
    target.$.next({ type: 'SET', prop, val, oldVal })
    return true
  },
  get: (target, prop, receiver) => {
    switch (prop) {
      case '__isSubX__':
        return true
      case 'toJSON':
        return () => R.pipe(R.dissoc('$'), R.dissoc('$$'), R.dissoc('__subscription__'))(target)
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
    if (val && val.__isSubX__) {
      val.__subscription__.unsubscribe()
    }
    delete target[prop]
    target.$.next({ type: 'DELETE', prop, val })
    return true
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
        proxy.$.subscribe(action => proxy.$$.next(R.pipe(R.assoc('path', [action.prop]), R.dissoc('prop'))(action)))
        return proxy
      }
    }
    return Model
  }
}

const DefaultModel = new SubX({})
SubX.create = (obj = {}) => new DefaultModel(obj)

export default SubX
