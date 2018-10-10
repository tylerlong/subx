/* eslint-env jest */
import SubX, { runAndMonitor } from '../src/index'

describe('monitor delete', () => {
  test('default', () => {
    const store = SubX.create({
      todos: [
        {
          title: '111',
          completed: false
        },
        {
          title: '222',
          completed: false
        },
        {
          title: '333',
          completed: false
        }
      ]
    })
    const render = props => {
      const todo = props.todo
      expect(todo.completed).toBeFalsy()
      expect(todo.cache).toBeUndefined()
      expect(todo.title).toBe('333')
    }
    const props = { store, todo: store.todos[2] }
    const { result, stream } = runAndMonitor(props, () => render(props))
    expect(result).toBeUndefined()
    const events = []
    stream.subscribe(e => events.push(e))
    store.todos.splice(2, 1)
    expect(events).toEqual([ // because todo's props were accessed 3 times in render method
      { type: 'DELETE',
        path: [ 'todos', '2' ],
        val: { title: '333', completed: false } },
      { type: 'DELETE',
        path: [ 'todos', '2' ],
        val: { title: '333', completed: false } },
      { type: 'DELETE',
        path: [ 'todos', '2' ],
        val: { title: '333', completed: false } }
    ])
    expect(events[0]).toBe(events[1])
    expect(events[1]).toBe(events[2]) // the same event received 3 times
  })
})
