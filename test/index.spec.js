/* eslint-env jest */
import SubX from '../src/index'

describe('index', () => {
  test('props', () => {
    const Model = SubX({
      a: 'hello',
      b: 'world'
    })
    const model = new Model()
    expect(model.a).toBe('hello')
    expect(model.b).toBe('world')

    let count = 0
    let mutations = []
    model.$.subscribe(val => {
      count += 1
      mutations.push(val)
    })
    model.a = '111'
    model.b = '222'
    expect(count).toBe(2)
    expect(mutations).toEqual([
      { prop: 'a', val: '111', oldVal: 'hello' },
      { prop: 'b', val: '222', oldVal: 'world' }
    ])
  })

  test('streams', () => {
    const Model = SubX({
      a: 'hello'
    })
    const model = new Model()
    const mutations = []
    model.a$.subscribe(val => {
      mutations.push(val)
    })
    model.a = 'world'
    expect(mutations).toEqual([{ prop: 'a', val: 'world', oldVal: 'hello' }])
  })

  test('different ways to trigger event', () => {
    const Model = SubX({
      a: '111'
    })
    const model = new Model()
    const mutations = []
    model.a$.subscribe(val => {
      mutations.push(val)
    })
    model.a = '222'
    model['a'] = '333'
    expect(mutations).toEqual([
      { prop: 'a', val: '222', oldVal: '111' },
      { prop: 'a', val: '333', oldVal: '222' }
    ])
  })
})
