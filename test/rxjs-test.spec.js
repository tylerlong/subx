/* eslint-env jest */
import { Subject } from 'rxjs'
import { map, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('rxjs', () => {
  test('lazy: map first', async () => {
    const subject = new Subject()
    let count = 0
    subject.pipe(
      map(val => {
        count += 1
        return val + '_new'
      }),
      debounceTime(100)
    ).subscribe(val => {
      console.log(val)
    })

    subject.next('hello')
    subject.next('world')

    await delay(200)
    expect(count).toBe(2) // debountTime won't reduce the times of `map`
  })
})
