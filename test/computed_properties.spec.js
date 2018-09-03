/* eslint-env jest */
import SubX from '../src/index'
import { merge, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('computed properties', () => {
  test('self + arrow function', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed(self => ({
      fullName: () => `${self.firstName} ${self.lastName}`
    }))
    const person = new Person()
    expect(person.fullName()).toBe('San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
  })

  test('this + normal function', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName () {
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = new Person()
    expect(person.fullName()).toBe('San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
  })

  test('mixed 1', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed(self => ({
      fullName () {
        return `${self.firstName} ${self.lastName}`
      }
    }))
    const person = new Person()
    expect(person.fullName()).toBe('San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
  })

  test('mixed 2', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed(function (self) {
      return {
        fullName: () => {
          return `${self.firstName} ${self.lastName}`
        }
      }
    })
    const person = new Person()
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
    let fullName
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName () {
        count += 1
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = new Person()

    person.fullName$(
      person.firstName$.pipe(
        merge(person.lastName$),
        debounceTime(1000)
      )
    ).subscribe(val => {
      fullName = val
    })

    person.firstName = 'Si'
    person.lastName = 'Li'

    person.lastName = 'Wang'
    person.firstName = 'Wu'

    await delay(1500)

    expect(count).toBe(1) // no more than 1 time of expensive computation
    expect(fullName).toBe('Wu Wang')
  })

  test('computed property with arguments', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed(self => ({
      fullName: () => `${self.firstName} ${self.lastName}`,
      greeting: (phrase) => `${phrase} ${self.fullName()}`
    }))
    const person = new Person()
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

  test('computed property with arguments 2', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName () {
        return `${this.firstName} ${this.lastName}`
      },
      greeting (phrase) {
        return `${phrase} ${this.fullName()}`
      }
    })
    const person = new Person()
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
})
