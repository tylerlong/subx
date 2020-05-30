/* eslint-env jest */
import SubX from '../build/index'

describe('defineProperty', () => {
  test('default', () => {
    const o = {}
    let count = 0
    const handler = {
      set: (target, prop, val, receiver) => {
        count += 1
        target[prop] = val
        return true
      }
    }
    const p = new Proxy(o, handler)
    p.a = 1
    expect(count).toBe(1)
    Object.defineProperty(p, 'b', { value: 2 })
    Object.defineProperty(p, 'a', { value: 3 })
    expect(p.b).toBe(2)
    expect(p.a).toBe(3)
    expect(count).toBe(1) // defineProperty doesn't trigger handler.set
  })
  test('override', () => {
    const o = {}
    let count = 0
    const handler = {
      set: (target, prop, val, receiver) => {
        count += 1
        target[prop] = val
        return true
      }
    }
    const p = new Proxy(o, handler)
    p.a = 1
    expect(count).toBe(1)
    Object.defineProperty(p, 'a', { value: 2 })
    Object.defineProperty(p, 'a', { value: 3 })
    expect(p.a).toBe(3)
    expect(count).toBe(1) // defineProperty doesn't trigger handler.set
  })
  test('subX', () => {
    const p = SubX.create()
    const f = () => Object.defineProperty(p, 'a', { value: 1 })
    expect(f).toThrow(TypeError)
    expect(p.a).toBeUndefined()
  })
  test('override with getter function', () => {
    const o = { a: 1, b: 2, c: 3 }
    expect(o.c).toBe(3)
    Object.defineProperty(o, 'c', {
      get: function () {
        return this.a / this.b
      }
    })
    expect(o.c).toBe(0.5)
    expect('get' in Object.getOwnPropertyDescriptor(o, 'c')).toBeTruthy()
  })
})
