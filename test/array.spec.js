/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('array', () => {
  test('foreach', () => {
    const a = SubX.create([1, 2, 3])
    a.push(4)
    let count = 0
    R.forEach(() => { count += 1 }, a)
    expect(count).toBe(4)
  })
  test('array', () => {
    // const a = SubX.create([])
    // const events = []
    // a.$.subscribe(event => {
    //   events.push(event)
    // })
    // a.push(1)
    // a.push(2)
    // a[1] = 3
    // a.unshift(0)
    // console.log(a)
    // expect(R.toPairs(a)).toEqual([['0', 0], ['1', 1], ['2', 3]])
    // expect(events).toEqual([
    //   {
    //     type: 'SET',
    //     prop: '0',
    //     val: 1,
    //     oldVal: undefined
    //   },
    //   {
    //     type: 'SET',
    //     prop: 'length',
    //     val: 1,
    //     oldVal: 1
    //   },
    //   {
    //     type: 'SET',
    //     prop: '1',
    //     val: 2,
    //     oldVal: undefined
    //   },
    //   {
    //     type: 'SET',
    //     prop: 'length',
    //     val: 2,
    //     oldVal: 2
    //   },
    //   {
    //     type: 'SET',
    //     prop: '1',
    //     val: 3,
    //     oldVal: 2
    //   }
    // ])
  })
})
