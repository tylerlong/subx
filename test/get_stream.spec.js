/* eslint-env jest */
import SubX from '../src/index'

describe('get stream', () => {
  test('default', () => {
    const p = SubX.create()
    const events = []
    p.get$.subscribe(event => {
      events.push(event)
    })
    p.b = p.a
    expect(events).toEqual([
      {
        type: 'GET',
        path: ['a']
      }
    ])
  })

  test('nested', () => {
    const p = SubX.create({ a: { b: { c: 'hello' } } })
    const events1 = []
    p.get$.subscribe(event => {
      events1.push(event)
    })
    const events2 = []
    p.get$$.subscribe(event => {
      events2.push(event)
    })
    p.a.b.d = p.a.b.c
    expect(events1).toEqual([
      {
        type: 'GET',
        path: ['a']
      },
      {
        type: 'GET',
        path: ['a']
      }
    ])
    expect(events2).toEqual([
      {
        type: 'GET',
        path: ['a']
      },
      {
        type: 'GET',
        path: ['a', 'b']
      },
      {
        type: 'GET',
        path: ['a']
      },
      {
        type: 'GET',
        path: ['a', 'b']
      },
      {
        type: 'GET',
        path: ['a', 'b', 'c']
      }
    ])
  })
})
