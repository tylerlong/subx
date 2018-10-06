/* eslint-env jest */
import SubX from '../src/index'

describe('array splice', () => {
  test('default', () => {
    const store = SubX.create({
      todos: [1, 2, 3]
    })
    let notified = false
    store.$.subscribe(event => {
      notified = true
    })
    store.todos.push(4)
    expect(notified).toBeTruthy()
    notified = false
    store.todos.splice(1, 1)
    expect(notified).toBeTruthy()
    notified = false
    expect(store.todos.length).toBe(3)
    store.todos.push(5)
    expect(notified).toBeTruthy()
  })
  test('number of notifications', () => {
    const store = SubX.create({
      todos: [1, 2, 3]
    })
    const events = []
    store.$.subscribe(event => events.push(event))
    store.todos.splice(1, 1)
    expect(events[events.length - 1]).toEqual({ type: 'SET', path: [ 'todos', 'length' ], val: 2, oldVal: 3 })
    expect(events[events.length - 2].type).toBe('DELETE')
  })
  test('shift', () => {
    const store = SubX.create({
      todos: [1, 2, 3]
    })
    const events = []
    store.$.subscribe(event => events.push(event))
    store.todos.shift(0)
    expect(events[events.length - 1]).toEqual({ type: 'SET', path: [ 'todos', 'length' ], val: 2, oldVal: 3 })
    expect(events[events.length - 2].type).toBe('DELETE')
  })
})
