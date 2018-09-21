/* eslint-env jest */
import SubX from '../src/index'
import './benchmark'

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
  test('too flexible', () => {
    let count = 0
    const o = {}
    const handler = {
      set: (target, prop, val, receiver) => {
        target[prop] = val
        count += 1
        return true
      }
    }
    const p = new Proxy(o, handler)
    p.a = 1 // trigger handler.set
    expect(count).toBe(1)
    const b = {}
    Object.setPrototypeOf(p, b)
    b.c = 2 // doesn't trigget handler.set
    expect(count).toBe(1) // still 1
    expect(p.c).toBe(2)
  })
})
