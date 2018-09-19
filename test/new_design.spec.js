/* eslint-env jest */
import { Subject, combineLatest } from 'rxjs'
import { filter, map, startWith } from 'rxjs/operators'

import SubX from '../src/index'

describe('new design', () => {
  test('JSON.stringify', () => {
    const p = SubX.create({ hello: 'world' })
    p.firstName = 'Si'
    p.lastName = 'Li'
    p.firstName = 'Wu'
    p.lastName = 'Wang'

    console.log(JSON.stringify(p, null, 2))
  })

  test('nested', () => {
    const n = SubX.create({ a: { } })
    n.$.subscribe(event => {
      console.log(event)
    })
    n.a.$.subscribe(event => {
      console.log(event)
    })
    n.a.b = 'hello'
  })

  test('$$', () => {
    const n = SubX.create({ a: { } })
    n.$$.subscribe(event => {
      console.log(event)
    })
    n.a.b = {}
    n.a.b.c = {}
    n.a.b.c.$$.subscribe(event => {
      console.log(event)
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
    p.$.subscribe(event => {
      console.log(event)
      console.log(p.fullName())
    })
    p.firstName = 'Tyler'
    p.lastName = 'Lau'
  })

  test('rxjs operators', () => {
    const p = SubX.create({ firstName: '', lastName: '' })
    p.firstName = 'Chuntao'
    p.lastName = 'Liu'
    const firstName$ = p.$.pipe(filter(event => event.prop === 'firstName'), map(event => event.val), startWith(p.firstName))
    const lastName$ = p.$.pipe(filter(event => event.prop === 'lastName'), map(event => event.val), startWith(p.lastName))
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

  test('delete event', () => {
    const Person = new SubX({ firstName: '', lastName: '' })
    const p = new Person({ firstName: 'Chuntao', lastName: 'Liu' })
    const events = []
    p.$$.subscribe(event => {
      events.push(event)
      console.log(event)
    })
    delete p.firstName
    delete p.lastName
    expect(events.length).toBe(2)
    expect(events).toEqual([{
      type: 'DELETE',
      path: ['firstName'],
      val: 'Chuntao'
    }, {
      type: 'DELETE',
      path: ['lastName'],
      val: 'Liu'
    }])
  })
})
