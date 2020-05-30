/* eslint-env jest */
import { filter, skip } from 'rxjs/operators'

import SubX from '../build/index'

describe('autoRun', () => {
  test('default', () => {
    const p = SubX.create({ number: 1 })
    let count = 0
    SubX.autoRun(p, () => {
      count += 1
      return p.number * 10
    })
    p.number = 2
    p.number = 3
    p.number = 4
    p.number = 5
    expect(count).toBe(5)
  })

  test('stream', () => {
    const p = SubX.create({ number: 1 })
    const stream$ = SubX.autoRun(p, () => p.number * 10)
    const data = []
    stream$.subscribe(i => data.push(i))
    p.number = 2
    p.number = 3
    p.number = 4
    p.number = 5
    expect(data).toEqual([10, 20, 30, 40, 50])
  })

  test('stream complete', () => {
    const p = SubX.create({ number: 1 })
    let count = 0
    const stream$ = SubX.autoRun(p, () => {
      count += 1
      return p.number * 10
    })
    const data = []
    stream$.subscribe(i => data.push(i))
    p.number = 2
    p.number = 3
    stream$.complete()
    p.number = 4
    p.number = 5
    expect(count).toBe(3)
    expect(data).toEqual([10, 20, 30])
  })

  test('operators', () => {
    const p = SubX.create({ number: 1 })
    let count = 0
    const stream$ = SubX.autoRun(p, () => {
      count += 1
      return p.number * 10
    }, filter(e => p.number % 2 === 1))
    const data = []
    stream$.subscribe(i => data.push(i))
    p.number = 2
    p.number = 3
    p.number = 4
    p.number = 5
    expect(count).toBe(3)
    expect(data).toEqual([10, 30, 50])
  })

  test('operators 2', () => {
    const p = SubX.create({ number: 1 })
    let count = 0
    const stream$ = SubX.autoRun(p, () => {
      count += 1
      return p.number * 10
    }, filter(e => p.number % 2 === 0))
    const data = []
    stream$.subscribe(i => data.push(i))
    p.number = 2
    p.number = 3
    p.number = 4
    p.number = 5
    expect(count).toBe(3)
    expect(data).toEqual([10, 20, 40]) // operators doesn't affect first value
  })

  test('operators 3', () => {
    const p = SubX.create({ number: 1 })
    let count = 0
    const stream$ = SubX.autoRun(p, () => {
      count += 1
      return p.number * 10
    }, filter(e => p.number % 2 === 0))
    const data = []
    stream$.pipe(skip(1)).subscribe(i => data.push(i))
    p.number = 2
    p.number = 3
    p.number = 4
    p.number = 5
    expect(count).toBe(3)
    expect(data).toEqual([20, 40]) // we explicitly skip the first value
  })
})
