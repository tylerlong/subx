/* eslint-env jest */
import SubX from '../src/index'

describe('preventExtensions', () => {
  test('default', () => {
    const p = {}
    Object.preventExtensions(p)
    const f = () => { p.a = 1 }
    expect(f).toThrow(TypeError)
  })
  test('disallow preventExtensions', () => {
    const a = {}
    const handler = {
      preventExtensions: target => {
        return false
      }
    }
    const p = new Proxy(a, handler)
    const f = () => Object.preventExtensions(p)
    expect(f).toThrow(TypeError)
    Reflect.preventExtensions(p)
    p.a = 1
    expect(p.a).toBe(1)
  })
  // test('SubX', () => {
  //   const p = SubX.create({})
  //   const f = () => Object.preventExtensions(p)
  //   expect(f).toThrow(TypeError)
  //   Reflect.preventExtensions(p)
  //   p.a = 1
  //   expect(p.a).toBe(1)
  // })
  test('SubX', () => { // We do nothing to preventExtensions. Because JS proxy doesn't support Object.freeze/seal
    const p = SubX.create({})
    Object.preventExtensions(p) // or Reflect.preventExtensions(p)
    expect(() => { p.a = 1 }).toThrow(TypeError)
    expect(p.a).toBeUndefined()
  })
})
