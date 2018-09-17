/* eslint-env jest */
import { Subject, combineLatest } from 'rxjs'
import * as R from 'ramda'
import { filter, map, startWith } from 'rxjs/operators'

const handler = {
  set: (target, prop, val, receiver) => {
    if (prop === '$' || prop === '$$') {
      return false // disallow overriding $ or $$
    }
    const oldVal = target[prop]
    if (typeof val === 'object') {
      target[prop] = SubX.create(val, target, prop) // for recursive
    } else {
      target[prop] = val
    }
    target.$.next({ type: 'SET', prop, val, oldVal })
    return true
  },
  get: (target, prop, receiver) => {
    switch (prop) {
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

const SubX = {
  create: (value, parent, prop) => {
    const emptyValue = R.empty(value)
    emptyValue.$ = new Subject()
    emptyValue.$$ = new Subject()
    const proxy = new Proxy(emptyValue, handler)
    R.pipe(
      R.toPairs,
      R.forEach(([prop, val]) => { proxy[prop] = val })
    )(value)
    proxy.$.subscribe(action => proxy.$$.next(R.pipe(R.assoc('path', [action.prop]), R.dissoc('prop'))(action)))
    if (parent) {
      proxy.$$.subscribe(action => parent.$$.next(R.assoc('path', [prop, ...action.path], action)))
    }
    return proxy
  }
}

describe('new design', () => {
  test('prototype', () => {
    const p = SubX.create({ hello: 'world' })

    p.$.subscribe(action => {
      console.log('1:', action)
    })
    p.firstName = 'Si'
    p.lastName = 'Li'

    p.$.subscribe(action => {
      console.log('2:', action)
    })
    p.$$.subscribe(action => {
      console.log('3:', action)
    })
    p.firstName = 'Wu'
    p.lastName = 'Wang'

    console.log(JSON.stringify(p, null, 2))
  })

  test('array', () => {
    const a = SubX.create([])
    a.$.subscribe(action => {
      console.log(action)
    })
    a.push(1)
    a.push(2)
    a[1] = 3
    a.unshift()
  })

  test('nested', () => {
    const n = SubX.create({ a: { } })
    n.$.subscribe(action => {
      console.log(action)
    })
    n.a.$.subscribe(action => {
      console.log(action)
    })
    n.a.b = 'hello'
  })

  test('$$', () => {
    const n = SubX.create({ a: { } })
    n.$$.subscribe(action => {
      console.log(action)
    })
    n.a.b = {}
    n.a.b.c = {}
    n.a.b.c.$$.subscribe(action => {
      console.log(action)
    })
    n.a.b.c.d = {}
    n.a.b.c.d.e = {}
    console.log(n)
    console.log(n + '')
  })

  test('computed property', () => {
    const p = SubX.create({ firstName: '', lastName: '', fullName: function () { return `${this.firstName} ${this.lastName}` } })
    p.firstName = 'Chuntao'
    p.lastName = 'Liu'
    console.log(p.fullName())
    p.$.subscribe(action => {
      console.log(action)
      console.log(p.fullName())
    })
    p.firstName = 'Tyler'
    p.lastName = 'Lau'
  })

  test('rxjs operators', () => {
    const p = SubX.create({ firstName: '', lastName: '' })
    p.firstName = 'Chuntao'
    p.lastName = 'Liu'
    const firstName$ = p.$.pipe(filter(action => action.prop === 'firstName'), map(action => action.val), startWith(p.firstName))
    const lastName$ = p.$.pipe(filter(action => action.prop === 'lastName'), map(action => action.val), startWith(p.lastName))
    combineLatest(firstName$, lastName$).subscribe(([firstName, lastName]) => {
      console.log(`${firstName} ${lastName}`)
    })
    p.firstName = 'Tyler'
    p.lastName = 'Lau'
  })
})
