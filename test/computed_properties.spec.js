/* eslint-env jest */
import { debounceTime, map } from 'rxjs/operators'
import delay from 'timeout-as-promise'

import SubX from '../build/index'

describe('computed properties', () => {
  test('this + normal function', () => {
    const Person = SubX.model({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = Person.create()
    expect(person.fullName()).toBe('San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
  })

  test('debounce expensive computation', async () => {
    let count = 0
    const Person = SubX.model({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = Person.create()

    let fullName
    person.$.pipe(
      debounceTime(1),
      map(event => person.fullName())
    ).subscribe(val => {
      fullName = val
    })

    person.firstName = 'Si'
    person.lastName = 'Li'

    person.lastName = 'Wang'
    person.firstName = 'Wu'

    await delay(5)

    expect(count).toBe(1) // no more than 1 time of expensive computation
    expect(fullName).toBe('Wu Wang')
  })

  test('computed property with arguments', () => {
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

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')
    expect(person.greeting('Hello')).toBe('Hello Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
    expect(person.greeting('Good morning')).toBe('Good morning Wu Wang')
  })

  test('computed property as getter', () => {
    const Person = SubX.model({
      firstName: 'San',
      lastName: 'Zhang',
      get fullName () {
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = Person.create()
    expect(person.fullName).toBe('San Zhang')
  })
})
