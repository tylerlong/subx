/* eslint-env jest */
import SubX from '../src'

describe('keys stream', () => {
  test('keys$', () => {
    const p = SubX.create()
    const events = []
    p.keys$.subscribe(event => {
      events.push(event)
    })
    p.a = Object.keys(p)
    p.c = Object.keys(p)
    expect(events).toEqual([
      {
        type: 'KEYS',
        path: [],
        val: []
      },
      {
        type: 'KEYS',
        path: [],
        val: ['a']
      }
    ])
  })
  test('keys$', () => {
    const p = SubX.create({ a: {}, b: {} })
    const events = []
    p.keys$.subscribe(event => {
      events.push(event)
    })
    p.a.c = Object.keys(p.a)
    p.b.d = Object.keys(p.a)
    expect(events).toEqual([
      {
        type: 'KEYS',
        path: ['a'],
        val: []
      },
      {
        type: 'KEYS',
        path: ['a'],
        val: ['c']
      }
    ])
  })
})
