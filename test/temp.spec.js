/* eslint-env jest */
import SubX from '../src/index'
import { merge, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('computed properties', () => {
  test('demo 1', async () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName: function () {
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
      console.log('Full name changed', val)
    })

    person.firstName = 'Si'
    person.lastName = 'Li'

    person.lastName = 'Wang'
    person.firstName = 'Wu'

    await delay(1500)
  })
})
