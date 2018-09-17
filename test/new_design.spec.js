/* eslint-env jest */
import { Subject } from 'rxjs'
import * as R from 'ramda'

const handler = {
  set: (target, property, value, receiver) => {
    target.$.next({
      prop: property,
      val: value,
      type: 'SET'
    })
    if (typeof value === 'object' && !value.__isInstanceOfSubX) {
      target[property] = SubX.create(value, target, property)
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
}

const SubX = {
  create: (target, parent, property) => {
    target.$ = new Subject()
    target.$$ = new Subject()
    target.$.subscribe(mutation => target.$$.next(R.pipe(R.assoc('path', [mutation.prop]), R.dissoc('prop'))(mutation)))
    if (parent) {
      target.$$.subscribe(mutation => parent.$$.next(R.assoc('path', [property, ...mutation.path], mutation)))
    }
    R.pipe(
      R.toPairs,
      R.filter(([property, val]) => property !== '$' && property !== '$$' && typeof val === 'object' && !val.__isInstanceOfSubX),
      R.forEach(([property, val]) => { target[property] = SubX.create(val, target, property) })
    )(target)
    return new Proxy(target, handler)
  }
}

describe('new design', () => {
  test('prototype', () => {
    const p = SubX.create({ hello: 'world' })

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
    const a = SubX.create([])
    a.$.subscribe(mutation => {
      console.log(mutation)
    })
    a.push(1)
    a.push(2)
    a[1] = 3
    a.unshift()
  })

  test('nested', () => {
    const n = SubX.create({ a: { } })
    n.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b = 'hello'
  })

  test('$$', () => {
    const n = SubX.create({ a: { } })
    n.$$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b = {}
    n.a.b.c = {}
    n.a.b.c.$$.subscribe(mutation => {
      console.log(mutation)
    })
    n.a.b.c.d = {}
    n.a.b.c.d.e = {}
  })
})
