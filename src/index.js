import { Subject, merge } from 'rxjs'
import { filter } from 'rxjs/operators'
import * as R from 'ramda'

const RESERVED_PROPERTIES = [
  '$', 'set$', 'delete$', 'get$', 'has$', 'ownKeys$',
  '$$', 'set$$', 'delete$$', 'get$$', 'has$$', 'ownKeys$$'
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
      subscriptions.push(proxy.$$.subscribe(event => receiver.$$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.get$$.subscribe(event => receiver.get$$.next(R.assoc('path', [prop, ...event.path], event))))
      target[prop] = proxy
    } else {
      target[prop] = val
    }
    target.set$.next({ type: 'SET', path: [prop], val, oldVal })
    while (subscriptions.length > 0) {
      const subscription = subscriptions.pop()
      const temp = target.$.pipe(filter(event => event.path[0] === prop)).subscribe(event => {
        subscription.unsubscribe()
        temp.unsubscribe()
      })
    }
    return true
  },
  get: (target, prop, receiver) => {
    if (!R.contains(prop, RESERVED_PROPERTIES)) {
      target.get$.next({ type: 'GET', path: [prop] })
    }
    switch (prop) {
      case '__isSubX__':
        return true
      case 'toJSON':
        return () => R.reduce((t, k) => R.dissoc(k, t), target, RESERVED_PROPERTIES)
      case 'toString':
        return () => `SubX ${JSON.stringify(receiver, null, 2)}`
      case 'inspect':
        return () => receiver.toString()
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
    target.delete$.next({ type: 'DELETE', path: [prop], val })
    return true
  },
  ownKeys: target => {
    return R.without(RESERVED_PROPERTIES, Object.getOwnPropertyNames(target))
  },
  setPrototypeOf: (target, prototype) => {
    return false // disallow setPrototypeOf
  },
  preventExtensions: target => {
    return false // disallow preventExtensions
  },
  defineProperty: (target, property, descriptor) => {
    return false // disallow defineProperty
  }
}

class SubX {
  constructor (modelObj = {}) {
    class Model {
      constructor (obj = {}) {
        const emptyValue = R.empty(obj)
        emptyValue.set$ = new Subject()
        emptyValue.delete$ = new Subject()
        emptyValue.get$ = new Subject()
        emptyValue.$ = merge(emptyValue.set$, emptyValue.delete$)
        emptyValue.$$ = new Subject()
        emptyValue.get$$ = new Subject()
        const proxy = new Proxy(emptyValue, handler)
        R.pipe(
          R.concat,
          R.forEach(([prop, val]) => { proxy[prop] = val })
        )(R.toPairs(modelObj), R.toPairs(obj))
        proxy.$.subscribe(event => proxy.$$.next(event))
        proxy.get$.subscribe(event => proxy.get$$.next(event))
        return proxy
      }
    }
    return Model
  }
}

const DefaultModel = new SubX({})
SubX.create = (obj = {}) => new DefaultModel(obj)

export default SubX
