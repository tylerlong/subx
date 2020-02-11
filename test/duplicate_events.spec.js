/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'
import { removeDuplicateEvents } from '../src/monitor'

describe('duplicate events', () => {
  test('get$', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ store, todo })

    let events = []
    props.get$.subscribe(e => events.push(e))
    expect(todo.title).toBe('222')
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'GET',
        path: ['store', 'todos', '1', 'title']
      },
      {
        type: 'GET',
        path: ['todo', 'title']
      }
    ])
    expect(events[0].id).toBe(events[1].id)

    events = []
    todo.a = { b: { c: { d: 'hello' } } }
    expect(todo.a.b.c.d).toBe('hello')
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { path: ['store', 'todos', '1', 'a'], type: 'GET' },
      { path: ['todo', 'a'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a', 'b'], type: 'GET' },
      { path: ['todo', 'a', 'b'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a', 'b', 'c'], type: 'GET' },
      { path: ['todo', 'a', 'b', 'c'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a', 'b', 'c', 'd'], type: 'GET' },
      { path: ['todo', 'a', 'b', 'c', 'd'], type: 'GET' }
    ])
    expect(events[0].id).toBe(events[1].id)
    expect(events[2].id).toBe(events[3].id)
    expect(events[4].id).toBe(events[5].id)
    expect(events[6].id).toBe(events[7].id)

    events = []
    expect(store.todos[1].a.b.c.d).toBe('hello')
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { path: ['store', 'todos'], type: 'GET' },
      { path: ['store', 'todos', '1'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a'], type: 'GET' },
      { path: ['todo', 'a'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a', 'b'], type: 'GET' },
      { path: ['todo', 'a', 'b'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a', 'b', 'c'], type: 'GET' },
      { path: ['todo', 'a', 'b', 'c'], type: 'GET' },
      { path: ['store', 'todos', '1', 'a', 'b', 'c', 'd'], type: 'GET' },
      { path: ['todo', 'a', 'b', 'c', 'd'], type: 'GET' }
    ])
  })

  test('remove duplicates - access via shorter', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ store, todo })
    const events = []
    props.get$.subscribe(e => events.push(e))
    todo.a = { b: { c: { d: 'hello' } } }
    expect(todo.a.b.c.d).toBe('hello')
    expect(R.map(R.dissoc('id'), removeDuplicateEvents(events))).toEqual([
      {
        type: 'GET',
        path: ['todo', 'a']
      },
      {
        type: 'GET',
        path: ['todo', 'a', 'b']
      },
      {
        type: 'GET',
        path: ['todo', 'a', 'b', 'c']
      },
      {
        type: 'GET',
        path: ['todo', 'a', 'b', 'c', 'd']
      }
    ])
  })

  test('remove duplicates - access via longer', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ store, todo })
    const events = []
    props.get$.subscribe(e => events.push(e))
    todo.a = { b: { c: { d: 'hello' } } }
    expect(store.todos[1].a.b.c.d).toBe('hello')
    expect(R.map(R.dissoc('id'), removeDuplicateEvents(events))).toEqual([
      {
        type: 'GET',
        path: ['store', 'todos']
      },
      {
        type: 'GET',
        path: ['store', 'todos', '1']
      },
      {
        type: 'GET',
        path: ['store', 'todos', '1', 'a']
      },
      {
        type: 'GET',
        path: ['store', 'todos', '1', 'a', 'b']
      },
      {
        type: 'GET',
        path: ['store', 'todos', '1', 'a', 'b', 'c']
      },
      {
        type: 'GET',
        path: ['store', 'todos', '1', 'a', 'b', 'c', 'd']
      }
    ])
  })

  test('delete$', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ store, todo })
    todo.a = { b: { c: { d: 'world' } } }

    const events = []
    props.delete$.subscribe(e => events.push(e))
    delete todo.a.b.c
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { path: ['store', 'todos', '1', 'a', 'b', 'c'], type: 'DELETE' },
      { path: ['todo', 'a', 'b', 'c'], type: 'DELETE' }
    ])
    expect(events[0].id).toBe(events[1].id)
  })

  test('access via longer one', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ todo, zzz: store })

    const events = []
    props.get$.subscribe(e => events.push(e))
    expect(store.todos[1].title).toBe('222')
    expect(store.todos[1].completed).toBe(false)

    expect(R.map(R.dissoc('id'), removeDuplicateEvents(events))).toEqual([
      { path: ['zzz', 'todos'], type: 'GET' },
      { path: ['zzz', 'todos', '1'], type: 'GET' },
      { path: ['zzz', 'todos', '1', 'title'], type: 'GET' },
      { path: ['zzz', 'todos'], type: 'GET' },
      { path: ['zzz', 'todos', '1'], type: 'GET' },
      { path: ['zzz', 'todos', '1', 'completed'], type: 'GET' }
    ])
  })

  test('access via saved longer one', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ zzz: store, todo })

    const events = []
    props.get$.subscribe(e => events.push(e))
    const todo2 = store.todos[1]
    expect(todo2.title).toBe('222')
    expect(todo2.completed).toBe(false)
    expect(todo2.title).toBe('222')

    expect(R.map(R.dissoc('id'), removeDuplicateEvents(events))).toEqual([
      { path: ['zzz', 'todos'], type: 'GET' },
      { path: ['zzz', 'todos', '1'], type: 'GET' },
      { path: ['zzz', 'todos', '1', 'title'], type: 'GET' },
      { path: ['todo', 'completed'], type: 'GET' },
      { path: ['todo', 'title'], type: 'GET' }
    ])
  })

  test('access via shorter one', () => {
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
    const todo = store.todos[1]
    const props = SubX.create({ todo, zzz: store })

    const events = []
    props.get$.subscribe(e => events.push(e))
    expect(todo.title).toBe('222')
    expect(todo.completed).toBe(false)
    expect(todo.title).toBe('222')

    expect(R.map(R.dissoc('id'), removeDuplicateEvents(events))).toEqual([
      { path: ['todo', 'title'], type: 'GET' },
      { path: ['todo', 'completed'], type: 'GET' },
      { path: ['todo', 'title'], type: 'GET' }
    ])
  })
})
