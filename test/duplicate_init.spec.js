/* eslint-env jest */

import SubX from '../src/index'

describe('duplicate init', () => {
  test('init once', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(4)
  })

  test('init twice', () => {
    let rectangle = SubX.create({ position: { }, size: { } })
    rectangle = SubX.create(rectangle)
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(4)
  })

  test('init 5 times', () => {
    let rectangle = SubX.create({ position: { }, size: { } })
    rectangle = SubX.create(rectangle)
    rectangle = SubX.create(rectangle)
    rectangle = SubX.create(rectangle)
    rectangle = SubX.create(rectangle)
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(4)
  })
})
