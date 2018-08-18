/* eslint-env jest */
import SubX from '../src/index'
import { combineLatest, map, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('computed properties', () => {
  test('demo', async () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    })

    const person = new Person()
    const fullName$ = person.firstName$.pipe(
      combineLatest(person.lastName$),
      // debounceTime(1000),
      map(([val1, val2]) => {
        console.log('expensive computation') // todo: this always execute, even I debounce below, have to debounce above
        return `${val1.val} ${val2.val}`
      })
    )
    fullName$
      .pipe(
        debounceTime(1000)
      )
      .subscribe(val => {
        console.log('Full name changed', val)
      })

    person.firstName = 'Si'
    person.lastName = 'Li'

    person.lastName = 'Wang'
    person.firstName = 'Wu'

    await delay(2000)
  })
})
