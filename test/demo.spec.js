/* eslint-env jest */
import { filter, timestamp, map } from 'rxjs/operators'
import { merge } from 'rxjs'

import SubX from '../src/index'

describe('demo', () => {
  test('props changed events', () => {
    const Person = new SubX({
      firstName: '',
      lastName: ''
    })
    const person = new Person({
      firstName: 'San',
      lastName: 'Zhang'
    })
    person.$.pipe(filter(event => event.prop === 'firstName')).subscribe(mutation => {
      console.log('First name changed', mutation)
    })
    person.$.pipe(filter(event => event.prop === 'lastName')).subscribe(mutation => {
      console.log('Last name changed', mutation)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })

  test('Subscribe to all the props changed events', () => {
    const Person = new SubX({
      firstName: 'San',
      lastName: 'Zhang'
    })
    const person = new Person()
    person.$.subscribe(mutation => {
      console.log('Prop changed', mutation)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })

  test('simplest', () => {
    const person = SubX.create({})
    person.$.subscribe(console.log)
    person.firstName = 'Tyler'
    person.lastName = 'Long'
  })

  test('OOP Style', () => {
    const Person = new SubX({ firstName: '' })

    const person1 = new Person()
    person1.$.subscribe(console.log)
    person1.firstName = 'Tyler'

    const person2 = new Person({ firstName: 'Peter' })
    person2.$.subscribe(console.log)
    person2.firstName = 'David'
  })

  test('dynamic prop', () => {
    const s = SubX.create({ prop1: 1 })
    s.$.subscribe(console.log)
    s.prop2 = 2
  })

  test('nested objects', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    rectangle.position.$.subscribe(console.log)
    rectangle.size.$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('track recursive - solution 1 (does NOT work)', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    rectangle.$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('merge stream', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    const mergeStream$ = merge(rectangle.position.$, rectangle.size.$)
    mergeStream$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('$$', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    rectangle.$$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('timestamp', () => {
    const rectangle = SubX.create({ position: { } })
    rectangle.$$.pipe(timestamp()).subscribe(console.log)
    rectangle.position.x = 0
  })

  test('timestamp flat', () => {
    const rectangle = SubX.create({ position: { } })
    rectangle.$$.pipe(
      timestamp(),
      map(event => ({ ...event.value, timestamp: event.timestamp }))
    ).subscribe(console.log)
    rectangle.position.x = 0
  })
})
