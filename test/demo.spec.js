/* eslint-env jest */
import { filter, timestamp, map } from 'rxjs/operators'
// import { merge } from 'rxjs'

import SubX from '../build/index'

describe('demo', () => {
  test('props changed events', () => {
    const Person = SubX.model({
      firstName: '',
      lastName: ''
    })
    const person = Person.create({
      firstName: 'San',
      lastName: 'Zhang'
    })
    person.$.pipe(filter(event => event.path[0] === 'firstName')).subscribe(event => {
      // console.log('First name changed', event)
    })
    person.$.pipe(filter(event => event.path[0] === 'lastName')).subscribe(event => {
      // console.log('Last name changed', event)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })

  test('Subscribe to all the props changed events', () => {
    const Person = SubX.model({
      firstName: 'San',
      lastName: 'Zhang'
    })
    const person = Person.create()
    person.$.subscribe(event => {
      // console.log('Prop changed', event)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })

  test('simplest', () => {
    const person = SubX.create({})
    // person.$.subscribe(console.log)
    person.firstName = 'Tyler'
    person.lastName = 'Long'
  })

  test('OOP Style', () => {
    const Person = SubX.model({ firstName: '' })

    const person1 = Person.create()
    // person1.$.subscribe(console.log)
    person1.firstName = 'Tyler'

    const person2 = Person.create({ firstName: 'Peter' })
    // person2.$.subscribe(console.log)
    person2.firstName = 'David'
  })

  test('dynamic prop', () => {
    const s = SubX.create({ prop1: 1 })
    // s.$.subscribe(console.log)
    s.prop2 = 2
  })

  test('nested objects', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    // rectangle.position.$.subscribe(console.log)
    // rectangle.size.$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('track recursive - solution 1 (does NOT work)', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    // rectangle.$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('merge stream', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    // const mergeStream$ = merge(rectangle.position.$, rectangle.size.$)
    // mergeStream$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('$', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    // rectangle.$.subscribe(console.log)
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
  })

  test('timestamp', () => {
    const rectangle = SubX.create({ position: { } })
    // rectangle.$.pipe(timestamp()).subscribe(console.log)
    rectangle.position.x = 0
  })

  test('timestamp flat', () => {
    const rectangle = SubX.create({ position: { } })
    rectangle.$.pipe(
      timestamp(),
      map(event => ({ ...event.value, timestamp: event.timestamp }))
    )
    // .subscribe(console.log)
    rectangle.position.x = 0
  })

  test('array', () => {
    const list = SubX.create([1, 2, 3])
    // list.$.subscribe(console.log)
    list.push(4)
    list.shift()
  })

  test('delete', () => {
    const person = SubX.create({ firstName: '' })
    // person.$.subscribe(console.log)
    delete person.firstName
  })

  test('computed property', () => {
    const Person = SubX.model({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        return `${this.firstName} ${this.lastName}`
      },
      greeting (phrase) {
        return `${phrase} ${this.fullName()}`
      }
    })
    const person = Person.create()
    expect(person.fullName()).toBe('San Zhang')
    expect(person.greeting('Hi')).toBe('Hi San Zhang')
  })
})
