/* eslint-env jest */
import SubX from '../src/index'
import './benchmark'

describe('cross reference', () => {
  // test('default', () => {
  //   const o = {}
  //   const handler = {
  //     set: (target, prop, val, receiver) => {
  //       target[prop] = val
  //       return true
  //     }
  //   }
  //   const a = { b: new Proxy(o, handler), c: new Proxy(o, handler) }
  //   a.b.c = 'hello'
  //   console.log(a)
  // })
  // test('default', () => {
  //   const p = {}
  //   const shared = {}
  //   p.a = shared
  //   p.b = shared
  //   console.log(p)
  //   p.a.c = 'hello'
  //   console.log(p)
  //   // expect(p).toEqual({
  //   //   a: { c: 'hello' },
  //   //   b: { c: 'hello' }
  //   // })
  // })
  test('SubX', () => {
    const p = SubX.create()
    const shared = {}
    p.a = shared
    p.b = shared
    console.log(p)
    p.a.c = 'hello'
    console.log(p)
    // expect(p).toEqual({
    //   a: { c: 'hello' },
    //   b: { c: 'hello' }
    // })
  })
  // test('SubX 2', () => {
  //   const p = {}
  //   const shared = {}
  //   p.a = SubX.create(shared)
  //   p.b = shared
  //   console.log(p)
  //   p.a.c = 'hello'
  //   console.log(p)
  // })
})
