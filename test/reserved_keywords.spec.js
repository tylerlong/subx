/* eslint-env jest */
import './benchmark'
import SubX from '../src/index'
import { Subject } from 'rxjs'

describe('Reserved keywords', () => {
  test('original data has keywords as prop', () => {
    const d = SubX.create({ $: 1, $$: 2 })
    expect(d.$ instanceof Subject).toBe(true)
    expect(d.$$ instanceof Subject).toBe(true)
    expect(JSON.stringify(d, null, 2)).toBe(`{
  "_$": 1,
  "_$$": 2
}`)
  })

  test('nested keyword properties', () => {

  })
})
