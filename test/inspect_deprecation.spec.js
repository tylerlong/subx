/* eslint-env jest */
import util from 'util'
import * as R from 'ramda'

import SubX from '../src/index'

describe('inspect deprecation', () => {
  test('default', () => {
    const o = {
      // inspect: () => '<myObject>' // deprecated
    }
    o[util.inspect.custom] = () => '<myObject>'
    expect(util.inspect(o)).toBe('<myObject>')
  })

  test('SubX', () => {
    const p = SubX.create({ a: 1, b: 2 })
    // https://github.com/nodejs/node/issues/31989
    expect(util.inspect(p)).not.toBe('{ a: 1, b: 2 }')
  })

  test('custom inspect', () => {
    const o = {
      a: 1,
      b: 2,
      get c () {
        return this.a + this.b
      }
    }
    o[util.inspect.custom] = () => {
      const result = {}
      R.pipe(
        R.keys,
        R.filter(k => k !== 'a'),
        R.forEach(k => Object.defineProperty(result, k, Object.getOwnPropertyDescriptor(o, k)))
      )(o)
      return result
    }
    expect(util.inspect(o)).toBe('{ b: 2, c: [Getter] }')
  })
})
