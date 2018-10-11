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
  test('foreach 2', () => {
    const a = SubX.create([1, 2, 3, 4])
    a[1] = 2
    a[2] = 3
    let count = 0
    R.forEach(() => { count += 1 }, a)
    expect(count).toBe(4)
  })
  test('keys', () => {
    const a = SubX.create([1, 2, 3])
    expect(R.keys(a)).toEqual(R.keys([1, 2, 3]))
  })
  test('toPairs', () => {
    const a = SubX.create([1, 2, 3])
    expect(R.toPairs(a)).toEqual([['0', 1], ['1', 2], ['2', 3]])
  })
  test('compare', () => {
    const a = SubX.create([1, 2, 3])
    expect(a).toEqual([1, 2, 3])
    expect(R.equals(a, [1, 2, 3])).toBeTruthy()
  })
  test('push', () => {
    const a = SubX.create([1, 2, 3])
    const events = []
    a.$.subscribe(event => {
      events.push(event)
    })
    a.push(4)
    expect(a).toEqual([1, 2, 3, 4])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['3'],
        val: 4,
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['length'],
        val: 4,
        oldVal: 4
      }
    ])
  })
  test('assign', () => {
    const a = SubX.create([1, 2, 3])
    const events = []
    a.$.subscribe(event => {
      events.push(event)
    })
    a[1] = 4
    expect(a).toEqual([1, 4, 3])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['1'],
        val: 4,
        oldVal: 2
      }
    ])
  })
  test('unshift', () => {
    const a = SubX.create([1, 2, 3])
    const events = []
    a.$.subscribe(event => {
      events.push(event)
    })
    a.unshift(0)
    expect(a).toEqual([0, 1, 2, 3])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['3'],
        val: 3,
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['2'],
        val: 2,
        oldVal: 3
      },
      {
        type: 'SET',
        path: ['1'],
        val: 1,
        oldVal: 2
      },
      {
        type: 'SET',
        path: ['0'],
        val: 0,
        oldVal: 1
      },
      {
        type: 'SET',
        path: ['length'],
        val: 4,
        oldVal: 4
      }
    ])
  })
  test('nested', () => {
    const o = SubX.create({ b: { a: [1, 2, 3] } })

    // foreach
    let count = 0
    R.forEach(() => { count += 1 }, o.b.a)
    expect(count).toBe(3)

    // keys
    expect(R.keys(o.b.a)).toEqual(R.keys([1, 2, 3]))

    // toPairs
    expect(R.toPairs(o.b.a)).toEqual([['0', 1], ['1', 2], ['2', 3]])

    // compare
    expect(o.b.a).toEqual([1, 2, 3])
    expect(R.equals(o.b.a, [1, 2, 3])).toBeTruthy()

    let events = []
    o.$.subscribe(event => { events.push(event) })

    // push
    o.b.a.push(4)
    expect(o.b.a).toEqual([1, 2, 3, 4])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['b', 'a', '3'],
        val: 4,
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['b', 'a', 'length'],
        val: 4,
        oldVal: 4
      }
    ])

    // assign
    o.b.a = [1, 2, 3]
    events = []
    o.b.a[1] = 4
    expect(o.b.a).toEqual([1, 4, 3])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['b', 'a', '1'],
        val: 4,
        oldVal: 2
      }
    ])

    // unshift
    o.b.a = [1, 2, 3]
    events = []
    o.b.a.unshift(0)
    expect(o.b.a).toEqual([0, 1, 2, 3])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['b', 'a', '3'],
        val: 3,
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['b', 'a', '2'],
        val: 2,
        oldVal: 3
      },
      {
        type: 'SET',
        path: ['b', 'a', '1'],
        val: 1,
        oldVal: 2
      },
      {
        type: 'SET',
        path: ['b', 'a', '0'],
        val: 0,
        oldVal: 1
      },
      {
        type: 'SET',
        path: ['b', 'a', 'length'],
        val: 4,
        oldVal: 4
      }
    ])
  })
})
