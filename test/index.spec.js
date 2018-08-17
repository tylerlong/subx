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
    // let count = 0
    // a.subscribe(val => {
    //   count += 1
    // })
    // a.b = 'hello'
    // a.c = 'world'
    // expect(count).toBe(2)
  })
})
