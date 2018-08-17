/* eslint-env jest */
import ReactiveClass from '../src/index'

describe('index', () => {
  test('demo', () => {
    let A = class {
      constructor () {
        this.b = 'hello'
        this.c = 'world'
      }
    }
    A = ReactiveClass(A)
    const a = new A()
    expect(a.b).toBe('hello')
    expect(a.c).toBe('world')
    let count = 0
    let mutations = []
    a.subscribe(val => {
      count += 1
      mutations.push(val)
    })
    a.b = 'bbb'
    a.c = 'ccc'
    expect(count).toBe(2)
    expect(mutations).toEqual([
      { prop: 'b', val: 'bbb', oldVal: 'hello' },
      { prop: 'c', val: 'ccc', oldVal: 'world' }
    ])
  })
})
