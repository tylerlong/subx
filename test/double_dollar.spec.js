/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('double dollar', () => {
  test('default', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    const events = []
    rectangle.$.subscribe(event => {
      events.push(event)
    })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100

    expect(R.map(R.dissoc('id'), events)).toEqual([
      { type: 'SET',
        path: ['position', 'x'] },
      { type: 'SET',
        path: ['position', 'y'] },
      { type: 'SET',
        path: ['size', 'width'] },
      { type: 'SET',
        path: ['size', 'height'] }
    ])
  })

  test('relative', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    const events1 = []
    rectangle.position.$.subscribe(event => {
      events1.push(event)
    })
    const events2 = []
    rectangle.size.$.subscribe(event => {
      events2.push(event)
    })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100

    expect(R.map(R.dissoc('id'), events1)).toEqual([
      { type: 'SET',
        path: ['x'] },
      { type: 'SET',
        path: ['y'] }
    ])
    expect(R.map(R.dissoc('id'), events2)).toEqual([
      { type: 'SET',
        path: ['width'] },
      { type: 'SET',
        path: ['height'] }
    ])
  })
})
