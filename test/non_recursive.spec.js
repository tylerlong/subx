/* eslint-env jest */

import SubX from '../src/index'

describe('non recursive', () => {
  test('recursive', () => {
    const rectangle = SubX.create({ position: { }, size: { } })
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(4)
  })

  test('recursive 2', () => {
    const Rectangle = new SubX({ position: { }, size: { } })
    const rectangle = new Rectangle()
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(4)
  })

  test('non recursive', () => {
    const rectangle = SubX.create({ position: { }, size: { } }, false)
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(0)
    rectangle.position = { x: 1, y: 2 }
    expect(count).toBe(1)
  })

  test('non recursive 2', () => {
    const Rectangle = new SubX({ position: { }, size: { } }, false)
    const rectangle = new Rectangle()
    let count = 0
    rectangle.$.subscribe(e => { count += 1 })
    rectangle.position.x = 0
    rectangle.position.y = 0
    rectangle.size.width = 200
    rectangle.size.height = 100
    expect(count).toBe(0)
    rectangle.position = { x: 1, y: 2 }
    expect(count).toBe(1)
  })
})
