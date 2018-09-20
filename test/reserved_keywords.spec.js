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

  test('assign', () => {
    const p = SubX.create({})
    p.$$ = 'hello'
    p.delete$ = 'world'
    expect(JSON.stringify(p, null, 2)).toBe(`{
  "_$$": "hello",
  "_delete$": "world"
}`)
  })

  test('nested', () => {
    const p = SubX.create({ a: { $: { } }, b: { } })
    p.b.get$$ = 'wonderful'
    p.a._$.c = 'good'
    expect(JSON.stringify(p, null, 2)).toBe(`{
  "a": {
    "_$": {
      "c": "good"
    }
  },
  "b": {
    "_get$$": "wonderful"
  }
}`)
  })
})
