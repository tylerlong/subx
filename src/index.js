import { Subject } from 'rxjs'
import * as R from 'ramda'

const handler = {
  set: (target, prop, val, receiver) => {
    if (prop === '$' || prop === '$$') {
      return false // disallow overriding $ or $$
    }
    const oldVal = target[prop]
    if (typeof val === 'object') {
      let proxy
      if (val.__isSubX) {
        proxy = val
      } else {
        proxy = SubX.create(val) // for recursive
      }
      proxy.$$.subscribe(action => receiver.$$.next(R.assoc('path', [prop, ...action.path], action)))
      target[prop] = proxy
    } else {
      target[prop] = val
    }
    target.$.next({ type: 'SET', prop, val, oldVal })
    return true
  },
  get: (target, prop, receiver) => {
    switch (prop) {
      case '__isSubX':
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
