/* eslint-env jest */
import SubX from '../src/index'
import './benchmark'

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
    let events = []
    model.$.subscribe(val => {
      count += 1
      events.push(val)
    })
    model.a = '111'
    model.b = '222'
    expect(count).toBe(2)
    expect(events).toEqual([
      { type: 'SET', prop: 'a', val: '111', oldVal: 'hello' },
      { type: 'SET', prop: 'b', val: '222', oldVal: 'world' }
    ])
  })

  test('streams', () => {
    const Model = new SubX({
      a: 'hello'
    })
    const model = new Model()
    const events = []
    model.$$.subscribe(val => {
      events.push(val)
    })
    model.a = 'world'
    expect(events).toEqual([{ type: 'SET', path: ['a'], val: 'world', oldVal: 'hello' }])
  })

  test('different ways to trigger event', () => {
    const Model = new SubX({
      a: '111'
    })
    const model = new Model()
    const events = []
    model.$$.subscribe(val => {
      events.push(val)
    })
    model.a = '222'
    model['a'] = '333'
    expect(events).toEqual([
      { type: 'SET', path: ['a'], val: '222', oldVal: '111' },
      { type: 'SET', path: ['a'], val: '333', oldVal: '222' }
    ])
  })
})
