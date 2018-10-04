/* eslint-env jest */
import SubX from '../src/index'

describe('todos', () => {
  test('index', () => {
    const store = SubX.create({
      todos: [
        {
          title: '111',
          completed: false
        },
        {
          title: '222',
          completed: true
        },
        {
          title: '333',
          completed: false
        }
      ],
      clearCompleted () {
        this.todos = this.todos.filter(todo => !todo.completed)
      }
    })
    let notified = false
    const todos = store.todos
    store.$.subscribe(event => { notified = true })
    expect(notified).toBeFalsy()
    todos.push({ title: '444', completed: false })
    expect(notified).toBeTruthy()

    store.clearCompleted() // todos are no longer tracked by store
    notified = false
    expect(notified).toBeFalsy()
    todos.push({ title: '555', completed: false })
    expect(notified).toBeFalsy() // not notified
    notified = false
  })
})
