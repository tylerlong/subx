/* eslint-env jest */
import SubX from '../src/index'

describe('cross reference', () => {
  test('default', () => {
    const o = {}
    const handler = {
      set: (target, prop, val, receiver) => {
        target[prop] = val
        return true
      }
    }
    const a = { b: new Proxy(o, handler), c: new Proxy(o, handler) }
    a.b.d = 'hello'
    expect(a).toEqual({
      b: {
        d: 'hello'
      },
      c: {
        d: 'hello'
      }
    })
  })
  test('default', () => {
    const p = {}
    const shared = {}
    p.a = shared
    p.b = shared
    p.a.c = 'hello'
    expect(p).toEqual({
      a: { c: 'hello' },
      b: { c: 'hello' }
    })
  })
  test('SubX', () => {
    const p = SubX.create()
    const shared = {}
    p.a = shared
    p.b = shared
    p.a.c = 'hello'
    expect(p.toObject()).toEqual({
      a: { c: 'hello' },
      b: { } // because there is R.empty(obj) in SubX's constructor
    })
  })
  test('SubX 2', () => {
    const p = {}
    const shared = {}
    p.a = SubX.create(shared)
    p.b = SubX.create(shared)
    p.b.c = 'hello'
    expect({ a: p.a.toObject(), b: p.b.toObject() }).toEqual({
      a: { }, // because there is R.empty(obj) in SubX's constructor
      b: { c: 'hello' }
    })
  })
})
