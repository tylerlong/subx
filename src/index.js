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
      subscriptions.push(proxy.set$$.subscribe(event => receiver.set$$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.delete$$.subscribe(event => receiver.delete$$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.get$$.subscribe(event => receiver.get$$.next(R.assoc('path', [prop, ...event.path], event))))
      subscriptions.push(proxy.has$$.subscribe(event => receiver.has$$.next(R.assoc('path', [prop, ...event.path], event))))
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
  has: (target, prop) => {
    const val = prop in target
    target.has$.next({ type: 'HAS', path: [prop], val })
    return val
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
        const val = R.empty(obj)

        val.set$ = new Subject()
        val.delete$ = new Subject()
        val.get$ = new Subject()
        val.has$ = new Subject()
        val.$ = merge(val.set$, val.delete$)

        val.set$$ = new Subject()
        val.delete$$ = new Subject()
        val.get$$ = new Subject()
        val.has$$ = new Subject()
        val.$$ = merge(val.set$$, val.delete$$)

        const proxy = new Proxy(val, handler)
        R.pipe(
          R.concat,
          R.forEach(([prop, val]) => { proxy[prop] = val })
        )(R.toPairs(modelObj), R.toPairs(obj))

        proxy.set$.subscribe(event => proxy.set$$.next(event))
        proxy.delete$.subscribe(event => proxy.delete$$.next(event))
        proxy.get$.subscribe(event => proxy.get$$.next(event))
        proxy.has$.subscribe(event => proxy.has$$.next(event))
        return proxy
      }
    }
    return Model
  }
}

const DefaultModel = new SubX({})
SubX.create = (obj = {}) => new DefaultModel(obj)

export default SubX
