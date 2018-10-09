/* eslint-env jest */
import SubX, { runAndMonitor } from '../src'

const store = SubX.create({
  todos: [],
  get leftCount () {
    return this.todos.filter(todo => !todo.completed).length
  }
})

let count = 0
const render = () => {
  count += 1
  expect(store.leftCount).toBeGreaterThanOrEqual(0)
}
const newRender = () => {
  const props = { store }
  const stream = runAndMonitor(props, render).stream
  const sub = stream.subscribe(event => {
    sub.unsubscribe()
    newRender()
  })
}

describe('Fake React', () => {
  test('default', () => {
    newRender()
    expect(count).toBe(1)
    store.todos.push({ title: '111', completed: false })
    expect(count).toBe(2)
    store.todos.push({ title: '222', completed: false })
    expect(count).toBe(3)
    store.todos.push({ title: '333', completed: false })
    expect(count).toBe(4)
    store.todos.push({ title: '444', completed: false })
    expect(count).toBe(5)
  })
})
