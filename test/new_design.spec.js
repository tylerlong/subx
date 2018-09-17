/* eslint-env jest */
import { Subject } from 'rxjs'
import * as R from 'ramda'

const handler = {
  set: (target, prop, val, receiver) => {
    if (prop === '$' || prop === '$$') {
      return false // disallow overriding $ or $$
    }
    target.$.next({ type: 'SET', prop, val })
    if (typeof val === 'object') {
      target[prop] = SubX.create(val, target, prop) // for recursive
    } else {
      target[prop] = val
    }
    return true
  },
  get: (target, prop, receiver) => {
    if (prop === 'toJSON') {
      return () => R.pipe(R.dissoc('$'), R.dissoc('$$'))(target)
    }
    if (prop === 'inspect') {
      return () => JSON.stringify(receiver, null, 2)
    }
    return target[prop]
  }
}

const SubX = {
  create: (value, parent, prop) => {
    value.$ = new Subject()
    value.$$ = new Subject()
    value.$.subscribe(mutation => value.$$.next(R.pipe(R.assoc('path', [mutation.prop]), R.dissoc('prop'))(mutation)))
    if (parent) {
      value.$$.subscribe(mutation => parent.$$.next(R.assoc('path', [prop, ...mutation.path], mutation)))
    }
    R.pipe(
      R.dissoc('$'),
      R.dissoc('$$'),
      R.toPairs,
      R.filter(([property, val]) => typeof val === 'object'),
      R.forEach(([property, val]) => { value[property] = SubX.create(val, value, property) })
    )(value)
    return new Proxy(value, handler)
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
    console.log(n)
  })
})
