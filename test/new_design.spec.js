/* eslint-env jest */
import { Subject, combineLatest } from 'rxjs'
import { filter, map, startWith } from 'rxjs/operators'

import SubX from '../src/index'

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

  test('delete property', () => {
    const p = SubX.create({ firstName: 'San', test: {} })
    delete p.firstName
    expect(p.firstName).toBeUndefined()
    let count1 = 0
    p.$$.subscribe(action => {
      count1 += 1
      console.log(action)
    })
    const test = p.test
    delete p.test
    let count2 = 0
    test.$$.subscribe(action => {
      count2 += 1
      console.log(action)
    })
    test.a = {}
    test.a.b = {}
    expect(count1).toBe(0)
    expect(count2).toBe(2)
  })

  test('override property', () => {
    const p = SubX.create({ a: { b: {} } })
    let count = 0
    p.$$.subscribe(action => {
      count += 1
      console.log(action)
    })
    const b = p.a.b
    b.c = {}
    b.d = {}
    p.a.b = {}
    expect(count).toBe(3)
    let count2 = 0
    b.$$.subscribe(action => {
      console.log(action)
      count2 += 1
    })
    b.c = {}
    b.d = {}
    expect(count).toBe(3) // still 3, because b is not longer children of p
    expect(count2).toBe(2)
    p.a.b.c = {}
    expect(count).toBe(4)
  })
})
