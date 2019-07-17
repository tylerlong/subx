/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('transaction', () => {
  test('default', () => {
    const p = SubX.create({
      a: 1
    })
    const events = []
    p.$.subscribe(e => events.push(e))
    p.a = 2
    p.a = 3
    p.a = 4
    expect(events.length).toBe(3)
  })

  test('transaction', () => {
    const p = SubX.create({
      a: {
        b: 1
      }
    })
    const events = []
    p.$.subscribe(e => events.push(e))
    const events2 = []
    p.transaction$.subscribe(e => events2.push(e))
    const events3 = []
    p.get$.subscribe(e => events3.push(e))
    p.a.startTransaction()
    p.a.b = 2
    p.a.b = 3
    p.a.b = 4
    expect(p.a.b).toBe(4) // trigger GET
    expect(p.a.b).toBe(4) // trigger GET
    expect(events.length).toBe(0)
    expect(events2.length).toBe(0)
    p.a.endTransaction()
    expect(events.length).toBe(0)
    expect(events2.length).toBe(1)
    expect(events3.length).toBe(7) // GET p.a
    expect(R.pipe(R.dissoc('events'), R.dissoc('id'))(events2[0])).toEqual({ path: ['a'], type: 'TRANSACTION' })
    expect(R.map(R.dissoc('id'), events2[0].events)).toEqual([
      { type: 'SET', path: ['b'] },
      { type: 'SET', path: ['b'] },
      { type: 'SET', path: ['b'] }
    ])
  })

  test('uniq transaction events', () => {
    const p = SubX.create({ a: 1 })
    let events = []
    p.transaction$.subscribe(e => events.push(e))
    p.startTransaction()
    p.a = 1
    expect(p.a).toBe(1)
    p.a = 2
    expect(p.a).toBe(2)
    delete p.a
    expect(p.a).toBeUndefined()
    p.endTransaction()
    expect(R.map(R.pipe(R.dissoc('events'), R.dissoc('id')), events)).toEqual([{ type: 'TRANSACTION', path: [] }])
    expect(R.map(R.dissoc('id'), events[0].events)).toEqual([
      { type: 'SET', path: ['a'] },
      { type: 'SET', path: ['a'] },
      { type: 'DELETE', path: ['a'] }
    ])

    events = []
    p.startTransaction()
    p.a = 1
    expect(p.a).toBe(1)
    delete p.a
    expect(p.a).toBeUndefined()
    p.a = 2
    expect(p.a).toBe(2)
    p.endTransaction()
    expect(R.map(R.pipe(R.dissoc('events'), R.dissoc('id')), events)).toEqual([{ type: 'TRANSACTION', path: [] }])
    expect(R.map(R.dissoc('id'), events[0].events)).toEqual([
      { type: 'SET', path: ['a'] },
      { type: 'DELETE', path: ['a'] },
      { type: 'SET', path: ['a'] }
    ])
  })
})
