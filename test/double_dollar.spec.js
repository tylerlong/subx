/* eslint-env jest */
import SubX from '../src/index'

describe('double dollar', () => {
  test('default', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    const events = []
    rectangle.$$.subscribe(event => {
      events.push(event)
    })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100

    expect(events).toEqual([
      { type: 'SET',
        val: 0,
        oldVal: undefined,
        path: [ 'position', 'x' ] },
      { type: 'SET',
        val: 0,
        oldVal: undefined,
        path: [ 'position', 'y' ] },
      { type: 'SET',
        val: 200,
        oldVal: undefined,
        path: [ 'size', 'width' ] },
      { type: 'SET',
        val: 100,
        oldVal: undefined,
        path: [ 'size', 'height' ] }
    ])
  })
})
