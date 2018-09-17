/* eslint-env jest */
import { Subject } from 'rxjs'
import * as R from 'ramda'

const createHandler = (parent, path = []) => ({
  set: (target, property, value, receiver) => {
    // const oldVal = target[property]
    if (typeof value === 'object' && !value.__isInstanceOfSubX) {
      target[property] = new SubX(value, parent, [property])
    } else {
      target[property] = value
    }
    if ('$' in target) {
      target.$.next({
        // target,
        prop: property,
        val: value
        // oldVal
      })
    }
    if ('$$' in target) {
      target.$.next({
        path: [property],
        val: value
      })
    }
    if (parent && '$$' in parent) {
      parent.$$.next({
        path: [...path, property],
        val: value
      })
    }
    return true
  },
  get: (target, property, receiver) => {
    if (property === '__isInstanceOfSubX') {
      return true
    }
    if (property === 'toJSON') {
      return () => R.pipe(R.dissoc('$'), R.dissoc('$$'))(target)
    }
    if (property === '$' && !('$' in target)) {
      target.$ = new Subject()
    }
    if (property === '$$' && !('$$' in target)) {
      target.$$ = new Subject()
    }
    return target[property]
  }
})

class SubX extends Proxy {
  constructor (target, parent, path = []) {
    super(target, createHandler(parent, path))
    R.pipe(
      R.toPairs,
      R.filter(([, val]) => typeof val === 'object' && !val.__isInstanceOfSubX),
      R.forEach(([property, val]) => { target[property] = new SubX(val, this, [property]) })
    )(target)
  }
}

describe('new design', () => {
  test('prototype', () => {
    const p = new SubX({ hello: 'world' })

    p.$.subscribe(mutation => {
      console.log('1:', mutation)
    })
    p.firstName = 'Si'
    p.lastName = 'Li'

    p.$.subscribe(mutation => {
      console.log('2:', mutation)
    })
    p.$$.subscribe(mutation => {
      console.log('3:', mutation)
    })
    p.firstName = 'Wu'
    p.lastName = 'Wang'

    console.log(JSON.stringify(p, null, 2))
  })

  test('array', () => {
    const a = new SubX([])
    a.$.subscribe(mutation => {
      console.log(mutation)
    })
    a.push(1)
    a.push(2)
    a[1] = 3
    a.unshift()
  })

  test('nested', () => {
    const n = new SubX({ a: { } })
    n.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b = 'hello'
  })

  test('$$', () => {
    const n = new SubX({ a: { } })
    n.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.$$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b = 'hello'
    n.a.b = 'world'
    n.c = 'test'
  })
})
