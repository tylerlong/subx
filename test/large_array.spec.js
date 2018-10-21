/* eslint-env jest */
import * as R from 'ramda'
import { merge } from 'rxjs'

import SubX from '../src/index'

const allEvents = p => merge(p.set$, p.delete$, p.get$, p.has$, p.keys$, p.compute_begin$, p.compute_finish$, p.stale$)

describe('large array', () => {
  test('push', () => {
    const p = SubX.create({
      todos: R.range(0, 3)
    })
    const all$ = allEvents(p)
    const events = []
    const sub = all$.subscribe(e => events.push(e))
    p.todos.push(1)
    sub.unsubscribe()
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todos'], 'type': 'GET' },
      { 'path': ['todos', 'push'], 'type': 'GET' },
      { 'path': ['todos', 'length'], 'type': 'GET' },
      { 'path': ['todos', '3'], 'type': 'SET' },
      { 'path': ['todos', 'length'], 'type': 'SET' }
    ])
  })
  test('unshift', () => {
    const p = SubX.create({
      todos: R.range(0, 3)
    })
    const all$ = allEvents(p)
    const events = []
    const sub = all$.subscribe(e => events.push(e))
    p.todos.unshift(1)
    sub.unsubscribe()
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todos'], 'type': 'GET' },
      { 'path': ['todos', 'unshift'], 'type': 'GET' },
      { 'path': ['todos', 'length'], 'type': 'GET' },
      { 'path': ['todos', '2'], 'type': 'HAS' },
      { 'path': ['todos', '2'], 'type': 'GET' },
      { 'path': ['todos', '3'], 'type': 'SET' },
      { 'path': ['todos', '1'], 'type': 'HAS' },
      { 'path': ['todos', '1'], 'type': 'GET' },
      { 'path': ['todos', '2'], 'type': 'SET' },
      { 'path': ['todos', '0'], 'type': 'HAS' },
      { 'path': ['todos', '0'], 'type': 'GET' },
      { 'path': ['todos', '1'], 'type': 'SET' },
      { 'path': ['todos', '0'], 'type': 'SET' },
      { 'path': ['todos', 'length'], 'type': 'SET' }
    ])
  })
  test('dummy splice', () => {
    const p = SubX.create({
      todos: R.range(0, 3)
    })
    const all$ = allEvents(p)
    const events = []
    const sub = all$.subscribe(e => events.push(e))
    p.todos.splice(1, 0)
    sub.unsubscribe()
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todos'], 'type': 'GET' },
      { 'path': ['todos', 'splice'], 'type': 'GET' },
      { 'path': ['todos', 'length'], 'type': 'GET' },
      { 'path': ['todos', 'constructor'], 'type': 'GET' },
      { 'path': ['todos', 'length'], 'type': 'SET' }
    ])
  })
  test('splice', () => {
    const p = SubX.create({
      todos: R.range(0, 3)
    })
    const all$ = allEvents(p)
    const events = []
    const sub = all$.subscribe(e => events.push(e))
    p.todos.splice(1, 1)
    sub.unsubscribe()
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todos'], 'type': 'GET' },
      { 'path': ['todos', 'splice'], 'type': 'GET' },
      { 'path': ['todos', 'length'], 'type': 'GET' },
      { 'path': ['todos', 'constructor'], 'type': 'GET' },
      { 'path': ['todos', '1'], 'type': 'HAS' },
      { 'path': ['todos', '1'], 'type': 'GET' },
      { 'path': ['todos', '2'], 'type': 'HAS' },
      { 'path': ['todos', '2'], 'type': 'GET' },
      { 'path': ['todos', '1'], 'type': 'SET' },
      { 'path': ['todos', '2'], 'type': 'DELETE' },
      { 'path': ['todos', 'length'], 'type': 'SET' }
    ])
  })
  test('R.remove', () => {
    const p = SubX.create({
      todos: R.range(0, 3)
    })
    const all$ = allEvents(p)
    const events = []
    const sub = all$.subscribe(e => events.push(e))
    p.todos = R.remove(1, 1, p.todos)
    sub.unsubscribe()
    expect(p.todos).toEqual([0, 2])
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todos'], 'type': 'GET' },
      { 'path': ['todos', '@@functional/placeholder'], 'type': 'GET' },
      { 'path': ['todos', 'length'], 'type': 'GET' },
      { 'path': ['todos', 'constructor'], 'type': 'GET' },
      { 'path': ['todos', '0'], 'type': 'HAS' },
      { 'path': ['todos', '0'], 'type': 'GET' },
      { 'path': ['todos', '1'], 'type': 'HAS' },
      { 'path': ['todos', '1'], 'type': 'GET' },
      { 'path': ['todos', '2'], 'type': 'HAS' },
      { 'path': ['todos', '2'], 'type': 'GET' },
      { 'path': ['todos', '__isSubX__'], 'type': 'GET' },
      { 'path': ['todos'], 'type': 'SET' }
    ])
  })
})
