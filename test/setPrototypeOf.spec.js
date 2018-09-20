/* eslint-env jest */
import SubX from '../src/index'

describe('setPrototypeOf', () => {
  test('default', () => {
    const a = {}
    const p = new Proxy(a, {})
    Object.setPrototypeOf(p, { b: 1 })
    expect(p.b).toBe(1)
  })
  test('disallow', () => {
    const a = {}
    const handler = {
      setPrototypeOf: (target, prototype) => {
        return false
      }
    }
    const p = new Proxy(a, handler)
    const f = () => Object.setPrototypeOf(p, { b: 1 })
    expect(f).toThrow(TypeError)
  })
  test('Reflect', () => {
    const a = {}
    const handler = {
      setPrototypeOf: (target, prototype) => {
        return false
      }
    }
    const p = new Proxy(a, handler)
    Reflect.setPrototypeOf(p, { b: 1 })
    expect(p.b).toBeUndefined()
  })
  test('SubX', () => {
    const p = SubX.create({})
    expect(p.b).toBeUndefined()
    Reflect.setPrototypeOf(p, { b: 1 })
    expect(p.b).toBeUndefined()
    const f = () => Object.setPrototypeOf(p, { b: 1 })
    expect(f).toThrow(TypeError)
  })
})
