/* eslint-env jest */
import ReactiveModel from '../src/index'

describe('index', () => {
  test('demo', () => {
    const Model = ReactiveModel({
      a: 'hello',
      b: 'world'
    })
    const model = new Model()
    expect(model.a).toBe('hello')
    expect(model.b).toBe('world')

    let count = 0
    let mutations = []
    model.subscribe(val => {
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
})
