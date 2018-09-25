/* eslint-env jest */
import util from 'util'

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
    const p = SubX.create()
    expect(util.inspect(p)).toBe('SubX {}')
  })
})
