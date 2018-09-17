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

  test('class', () => {
    const Person = new SubX({ firstName: 'San', lastName: 'Zhang', fullName: function () { return `${this.firstName} ${this.lastName}` } })
    const p = new Person({ firstName: 'Chuntao' })
    console.log(p.fullName())
  })

  test('instanceof', () => {
    const Person = new SubX({ name: 'Tyler Liu' })
    const p = new Person()
    console.log(p.name)
    expect(p instanceof Person).toBe(false)
  })

  test('$ or $$ as prop', () => {
    const d = SubX.create({ $: '$', $$: '$$' })
    expect(d.$ instanceof Subject).toBe(true)
    expect(d.$$ instanceof Subject).toBe(true)
  })
})
