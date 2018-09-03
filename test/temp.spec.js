/* eslint-env jest */
import SubX from '../src/index'
import {
  debounceTime,
  map
} from 'rxjs/operators'
import { merge } from 'rxjs'
import delay from 'timeout-as-promise'

describe('computed properties', () => {
  test('demo 1', async () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName () {
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
      }
    })
    const person = new Person()

    merge(person.firstName$, person.lastName$).pipe(
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
