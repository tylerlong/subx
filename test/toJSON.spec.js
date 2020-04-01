/* eslint-env jest */
import SubX from '../src/index'

describe('toJSON', () => {
  test('index', () => {
    const p = SubX.create({ a: { b: { c: 'd' } } })
    expect(p.toJSON()).toEqual({ a: { b: { c: 'd' } } })
  })
})
