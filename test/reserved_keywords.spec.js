/* eslint-env jest */
import './benchmark'
import SubX from '../src/index'
import { Subject } from 'rxjs'

describe('Reserved keywords', () => {
  test('original data has keywords as prop', () => {
    const d = SubX.create({ $: '$', $$: '$$' })
    expect(d.$ instanceof Subject).toBe(true)
    expect(d.$$ instanceof Subject).toBe(true)
  })
  test('nested keyword properties', () => {

  })
})
