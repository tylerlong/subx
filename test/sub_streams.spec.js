/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('sub streams', () => {
  test('set$', () => {
    const p = SubX.create()
    const events = []
    p.set$.subscribe(event => {
      events.push(event)
    })
    p.a = 1
    p.b = 2
    p.a = 3
    delete p.b
    expect(events).toEqual([
      {
        type: 'SET',
        path: ['a'],
        val: 1,
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['b'],
        val: 2,
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['a'],
        val: 3,
        oldVal: 1
      }
    ])
  })

  test('delete$', () => {
    const p = SubX.create()
    const events = []
    p.delete$.subscribe(event => {
      events.push(event)
    })
    p.a = 1
    p.b = 2
    p.a = 3
    delete p.b
    expect(events).toEqual([
      {
        type: 'DELETE',
        path: ['b'],
        val: 2
      }
    ])
  })

  test('$', () => {
    const p = SubX.create()
    const events1 = []
    const events2 = []
    const events3 = []
    p.set$$.subscribe(event => {
      events1.push(event)
    })
    p.delete$$.subscribe(event => {
      events2.push(event)
    })
    p.$$.subscribe(event => {
      events3.push(event)
    })
    p.a = 1
    p.b = 2
    p.a = 3
    delete p.b
    expect(events3).toEqual(R.concat(events1, events2))
  })
})
