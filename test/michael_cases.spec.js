/* eslint-env jest */
import SubX from '../src'

describe('Michael cases', () => {
  test('int then object', () => {
    const p = SubX.create({ a: 1 })
    const events = []
    p.$$.subscribe(event => events.push(event))
    p.a = {}
    p.a.b = 2
    expect(events).toEqual([
      { type: 'SET', path: [ 'a' ], val: {}, oldVal: 1 },
      { type: 'SET', path: [ 'a', 'b' ], val: 2, oldVal: undefined }
    ])
  })

  test('toString.call', () => {
    expect(toString.call(SubX.create([]))).toBe('[object Array]')
  })
})
