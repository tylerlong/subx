/* eslint-env jest */
import SubX from '../src/index'
import {
  debounceTime,
  map,
  filter
} from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('computed properties', () => {
  test('demo 1', async () => {
    const Person = new SubX({
      firstName: 'San',
      lastName: 'Zhang',
      fullName () {
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = new Person()

    person.$.pipe(
      filter(action => action.prop === 'firstName' || action.prop === 'lastName'),
      debounceTime(100),
      map(() => person.fullName())
    ).subscribe(val => {
      console.log('Full name changed', val)
    })

    person.firstName = 'Si'
    person.lastName = 'Li'

    person.lastName = 'Wang'
    person.firstName = 'Wu'

    await delay(150)
  })
})
