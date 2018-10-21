/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src'

describe('Michael cases', () => {
  test('int then object', () => {
    const p = SubX.create({ a: 1 })
    const events = []
    p.$.subscribe(event => events.push(event))
    p.a = {}
    p.a.b = 2
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { type: 'SET', path: [ 'a' ] },
      { type: 'SET', path: [ 'a', 'b' ] }
    ])
  })

  test('toString.call', () => {
    expect(toString.call(SubX.create([]))).toBe('[object Array]')
  })
})
