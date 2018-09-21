/* eslint-env jest */
import SubX from '../src/index'
import './benchmark'

describe('constructor', () => {
  test('no parameters', () => {
    const Todo = new SubX({
      text: '',
      done: false
    })
    const todo = new Todo()
    expect(todo.text).toBe('')
    expect(todo.done).toBe(false)
  })

  test('default properties', () => {
    const Todo = new SubX({
      text: '',
      done: false
    })
    const todo = new Todo({
      text: 'hello',
      done: true
    })
    expect(todo.text).toBe('hello')
    expect(todo.done).toBe(true)

    const todo2 = new Todo({
      text: 'world'
    })
    expect(todo2.text).toBe('world')
    expect(todo2.done).toBe(false)
  })
})
