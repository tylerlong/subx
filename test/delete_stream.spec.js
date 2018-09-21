/* eslint-env jest */
import SubX from '../src'

describe('delete stream', () => {
  test('delete$', () => {
    const p = SubX.create({ a: {}, b: {} })
    const events = []
    p.delete$$.subscribe(event => {
      events.push(event)
    })
    delete p.a
    delete p.b
    expect(events).toEqual([
      {
        type: 'DELETE',
        path: ['a'],
        val: {}
      },
      {
        type: 'DELETE',
        path: ['b'],
        val: {}
      }
    ])
  })
  test('delete$$', () => {
    const p = SubX.create({ a: {}, b: {} })
    const events = []
    p.delete$$.subscribe(event => {
      events.push(event)
    })
    delete p.a.c
    delete p.b.d
    expect(events).toEqual([
      {
        type: 'DELETE',
        path: ['a', 'c'],
        val: undefined
      },
      {
        type: 'DELETE',
        path: ['b', 'd'],
        val: undefined
      }
    ])
  })
})
