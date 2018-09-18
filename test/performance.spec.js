/* eslint-env jest */
import { from } from 'rxjs'
import { take, map, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

describe('performance', () => {
  test('take', () => {
    let count1 = 0
    let count2 = 0
    from([1, 2, 3]).pipe(
      map(i => {
        count1 += 1
        console.log('map')
        return i * 2
      }),
      take(1)
    ).subscribe(i => {
      count2 += 1
      console.log(i)
    })
    expect(count1).toBe(1)
    expect(count2).toBe(1)
  })
  test('debounceTime', async () => {
    let count1 = 0
    let count2 = 0
    from([1, 2, 3]).pipe(
      map(i => {
        count1 += 1
        console.log('map')
        return i * 2
      }),
      debounceTime(100)
    ).subscribe(i => {
      count2 += 1
      console.log(i)
    })
    await delay(150)
    expect(count1).toBe(3) // why? debounceTime is async, cannot save map's execution.
    expect(count2).toBe(1)
  })
})
