/* eslint-env jest */
import SubX from '../src/index'
import * as R from 'ramda'
import { merge } from 'rxjs'

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
    expect(R.dissoc('id', events[events.length - 1])).toEqual({ type: 'SET', path: [ 'todos', 'length' ] })
  })
  test('pop', () => {
    const store = SubX.create({
      todos: [1, 2, 3]
    })
    const events = []
    merge(store.$, store.delete$).subscribe(event => events.push(event))
    store.todos.pop()
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todos', '2'], 'type': 'DELETE' },
      { 'path': ['todos', 'length'], 'type': 'SET' }
    ])
  })
  test('shift', () => {
    const store = SubX.create({
      todos: [1, 2, 3]
    })
    const events = []
    store.$.subscribe(event => events.push(event))
    store.todos.shift(0)
    expect(R.dissoc('id', events[events.length - 1])).toEqual({ type: 'SET', path: [ 'todos', 'length' ] })
  })
  test('map and get events', () => {
    const store = SubX.create({
      todos: [1, 2, 3]
    })
    const events = []
    store.get$.subscribe(event => events.push(event))
    expect(store.todos.map(todo => todo)).toBeDefined()
    expect(R.any(event => R.equals(R.dissoc('id', event), { type: 'GET', path: [ 'todos', 'length' ] }), events)).toBeTruthy()
  })
})
