/* eslint-env jest */
import { Subject } from 'rxjs'
import * as R from 'ramda'

const createHandler = () => ({
  set: (target, property, value, receiver) => {
    target.$.next({
      prop: property,
      val: value
    })
    target.$$.next({
      path: [property],
      val: value
    })

    if (typeof value === 'object' && !value.__isInstanceOfSubX) {
      target[property] = new SubX(value, target, property)
    } else {
      target[property] = value
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
    return target[property]
  }
})

class SubX extends Proxy {
  constructor (target, parent, property) {
    target.$ = new Subject()
    target.$$ = new Subject()
    if (parent) {
      target.$$.subscribe(mutation => {
        parent.$$.next(R.assoc('path', [property, ...mutation.path], mutation))
      })
    }
    super(target, createHandler())
    R.pipe(
      R.toPairs,
      R.filter(([property, val]) => property !== '$' && property !== '$$' && typeof val === 'object' && !val.__isInstanceOfSubX),
      R.forEach(([property, val]) => { target[property] = new SubX(val, this, property) })
    )(target)
  }
}

describe('new design', () => {
  // test('prototype', () => {
  //   const p = new SubX({ hello: 'world' })

  //   p.$.subscribe(mutation => {
  //     console.log('1:', mutation)
  //   })
  //   p.firstName = 'Si'
  //   p.lastName = 'Li'

  //   p.$.subscribe(mutation => {
  //     console.log('2:', mutation)
  //   })
  //   p.$$.subscribe(mutation => {
  //     console.log('3:', mutation)
  //   })
  //   p.firstName = 'Wu'
  //   p.lastName = 'Wang'

  //   console.log(JSON.stringify(p, null, 2))
  // })

  // test('array', () => {
  //   const a = new SubX([])
  //   a.$.subscribe(mutation => {
  //     console.log(mutation)
  //   })
  //   a.push(1)
  //   a.push(2)
  //   a[1] = 3
  //   a.unshift()
  // })

  // test('nested', () => {
  //   const n = new SubX({ a: { } })
  //   n.$.subscribe(mutation => {
  //     console.log(mutation)
  //   })
  //   n.a.$.subscribe(mutation => {
  //     console.log(mutation)
  //   })
  //   n.a.b = 'hello'
  // })

  test('$$', () => {
    const n = new SubX({ a: { } })
    // n.$.subscribe(mutation => {
    //   console.log(mutation)
    // })
    // n.$$.subscribe(mutation => {
    //   console.log(mutation)
    // })
    // n.a.b = 'hello'
    // n.c = 'test'

    // n.a.b = 'world'

    // n.a.b = {}
    n.$$.subscribe(mutation => {
      console.log(mutation)
    })
    // n.a.$$.subscribe(mutation => {
    //   console.log(mutation)
    // })
    // n.a.b = 'hello'
    n.a.b = {}
    n.a.b.c = {}
    n.a.b.c.$$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b.c.d = {}
    n.a.b.c.d.e = {}
  })
})
