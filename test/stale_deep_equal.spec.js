/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('stale deep equal', () => {
  test('default', () => {
    const p = SubX.create({
      todos: [
        { completed: false },
        { completed: false },
        { completed: false }
      ],
      visibility: 'all',
      get visibleTodos () {
        if (this.visibility === 'all') {
          return this.todos
        } else if (this.visibility === 'active') {
          return this.todos.filter(todo => !todo.completed)
        } else if (this.visibility === 'completed') {
          return this.todos.filter(todo => todo.completed)
        }
      },
      get render () {
        return this.visibleTodos
      }
    })
    let events = []
    p.stale$.subscribe(event => events.push(event))
    expect(p.render.length).toBe(3)

    p.visibility = 'active'
    expect(R.map(R.pipe(R.dissoc('id')))(events)).toEqual([
      {
        type: 'STALE',
        path: ['visibleTodos'],
        cache: [
          { completed: false },
          { completed: false },
          { completed: false }
        ]
      },
      {
        type: 'STALE',
        path: ['render'],
        cache: [
          { completed: false },
          { completed: false },
          { completed: false }
        ]
      }
    ])

    events = []
    p.visibility = 'active' // same value
    expect(events).toEqual([])

    p.visibility = 'completed'
    expect(events).toEqual([]) // because we didn't invoke computed, won't trigger stale again
    expect(p.render.length).toBe(0)

    events = []
    p.todos[1].completed = true
    expect(p.render.length).toBe(1)
    expect(R.map(R.pipe(R.dissoc('id')))(events)).toEqual([
      { type: 'STALE',
        path: ['visibleTodos'],
        cache: []
      },
      { type: 'STALE',
        path: ['render'],
        cache: []
      }
    ])
  })
})
