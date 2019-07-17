/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('Symbol', () => {
  test('default', () => {
    const p = SubX.create()
    const a = Symbol('a')
    p[a] = 'hello'
    const events = []
    p.$.subscribe(e => events.push(e))
    p[a] = 'world'
    expect(R.map(R.dissoc('id'))(events)).toEqual([{ type: 'SET', path: [a] }])
    expect(a).toBe(a)
    expect(a).toEqual(a)
  })

  test('symbol and string mixed in path', () => {
    // todo
  })
})
