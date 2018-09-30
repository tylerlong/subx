/* eslint-env jest */
import { filter } from 'rxjs/operators'

import SubX from '../src'

describe('has stream', () => {
  test('default', () => {
    const p = SubX.create()
    const events = []
    p.has$.subscribe(event => {
      events.push(event)
    })
    p.b = 'a' in p
    expect(events).toEqual([
      {
        type: 'HAS',
        path: ['a'],
        val: false
      }
    ])
  })

  test('nested', () => {
    const p = SubX.create({ a: { b: { c: 'hello' } } })
    const events1 = []
    p.has$.pipe(filter(event => event.path.length === 1)).subscribe(event => {
      events1.push(event)
    })
    const events2 = []
    p.has$.subscribe(event => {
      events2.push(event)
    })
    p.b = 'a' in p
    p.a.b.c = 'd' in p.a.b
    expect(events1).toEqual([
      {
        type: 'HAS',
        path: ['a'],
        val: true
      }
    ])
    expect(events2).toEqual([
      {
        type: 'HAS',
        path: ['a'],
        val: true
      },
      {
        type: 'HAS',
        path: ['a', 'b', 'd'],
        val: false
      }
    ])
  })
})
