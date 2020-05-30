/* eslint-env jest */
import SubX from '../build/index'

describe('constructor', () => {
  test('no parameters', () => {
    const Todo = SubX.model({
      text: '',
      done: false
    })
    const todo = Todo.create()
    expect(todo.text).toBe('')
    expect(todo.done).toBe(false)
  })

  test('default properties', () => {
    const Todo = SubX.model({
      text: '',
      done: false
    })
    const todo = Todo.create({
      text: 'hello',
      done: true
    })
    expect(todo.text).toBe('hello')
    expect(todo.done).toBe(true)

    const todo2 = Todo.create({
      text: 'world'
    })
    expect(todo2.text).toBe('world')
    expect(todo2.done).toBe(false)
  })
})
