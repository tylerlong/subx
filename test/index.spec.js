/* eslint-env jest */
import SubX from '../src/index'

describe('index', () => {
  test('props', () => {
    const Model = new SubX({
      a: 'hello',
      b: 'world'
    })
    const model = new Model()
    expect(model.a).toBe('hello')
    expect(model.b).toBe('world')

    let count = 0
    let actions = []
    model.$.subscribe(val => {
      count += 1
      actions.push(val)
    })
    model.a = '111'
    model.b = '222'
    expect(count).toBe(2)
    expect(actions).toEqual([
      { type: 'SET', prop: 'a', val: '111', oldVal: 'hello' },
      { type: 'SET', prop: 'b', val: '222', oldVal: 'world' }
    ])
  })

  test('streams', () => {
    const Model = new SubX({
      a: 'hello'
    })
    const model = new Model()
    const actions = []
    model.$.subscribe(val => {
      actions.push(val)
    })
    model.a = 'world'
    expect(actions).toEqual([{ type: 'SET', prop: 'a', val: 'world', oldVal: 'hello' }])
  })

  test('different ways to trigger event', () => {
    const Model = new SubX({
      a: '111'
    })
    const model = new Model()
    const actions = []
    model.$.subscribe(val => {
      actions.push(val)
    })
    model.a = '222'
    model['a'] = '333'
    expect(actions).toEqual([
      { type: 'SET', prop: 'a', val: '222', oldVal: '111' },
      { type: 'SET', prop: 'a', val: '333', oldVal: '222' }
    ])
  })
})
