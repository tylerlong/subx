/* eslint-env jest */
import SubX from '../src'

describe('set stream', () => {
  test('set$', () => {
    const p = SubX.create()
    const events = []
    p.set$$.subscribe(event => {
      events.push(event)
    })
    p.a = 'hello'
    p.b = 'world'
    expect(events).toEqual([
      {
        type: 'SET',
        path: ['a'],
        val: 'hello',
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['b'],
        val: 'world',
        oldVal: undefined
      }
    ])
  })
  test('set$$', () => {
    const p = SubX.create({ a: {}, b: {} })
    const events = []
    p.set$$.subscribe(event => {
      events.push(event)
    })
    p.a.c = 'hello'
    p.b.d = 'world'
    expect(events).toEqual([
      {
        type: 'SET',
        path: ['a', 'c'],
        val: 'hello',
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['b', 'd'],
        val: 'world',
        oldVal: undefined
      }
    ])
  })
})
