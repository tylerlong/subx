/* eslint-env jest */
import SubX from '../src/index'
import { merge, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('computed properties', () => {
  test('demo 1', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({ // todo: auto bind this so that user can use arrow function
      fullName: function () {
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

  test('debounce expensive computation', async () => {
    let count = 0
    let fullName
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName: function () {
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
})
