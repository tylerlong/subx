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
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'title' ]
      },
      { type: 'GET',
        path: [ 'todo', 'title' ]
      }
    ])
    expect(events[0].id).toBe(events[1].id)

    events = []
    todo.a = { b: { c: { d: 'hello' } } }
    expect(todo.a.b.c.d).toBe('hello')
    expect(R.map(R.dissoc('id'), events)).toEqual(R.map(R.dissoc('id'), [
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a' ],
        id: 'cdd804c0-49a0-4ca3-8623-5dd2383d337a' },
      { type: 'GET',
        path: [ 'todo', 'a' ],
        id: 'cdd804c0-49a0-4ca3-8623-5dd2383d337a' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b' ],
        id: '0b0dce92-31a9-40fa-8865-b71d000a05d8' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b' ],
        id: '0b0dce92-31a9-40fa-8865-b71d000a05d8' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c' ],
        id: '15de561b-0ec4-448c-825c-d5fb087d8a9b' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c' ],
        id: '15de561b-0ec4-448c-825c-d5fb087d8a9b' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c', 'd' ],
        id: '6ff7380e-1088-4637-b8be-dfe0d1ab5701' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c', 'd' ],
        id: '6ff7380e-1088-4637-b8be-dfe0d1ab5701' }
    ]))
    expect(events[0].id).toBe(events[1].id)
    expect(events[2].id).toBe(events[3].id)
    expect(events[4].id).toBe(events[5].id)
    expect(events[6].id).toBe(events[7].id)

    events = []
    expect(store.todos[1].a.b.c.d).toBe('hello')
    expect(R.map(R.dissoc('id'), events)).toEqual(R.map(R.dissoc('id'), [
      { type: 'GET',
        path: [ 'store', 'todos' ],
        id: 'ccd367ca-fd6e-4400-ab3d-039309ca881f' },
      { type: 'GET',
        path: [ 'store', 'todos', '1' ],
        id: 'bf56cbcb-9d56-4f59-9ea3-4cbcca5d0c9f' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a' ],
        id: '0f10e195-14d1-49a0-99f4-5bc5e7a38108' },
      { type: 'GET',
        path: [ 'todo', 'a' ],
        id: '0f10e195-14d1-49a0-99f4-5bc5e7a38108' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b' ],
        id: '8682c81f-582b-437b-85cd-7fba0bbea26e' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b' ],
        id: '8682c81f-582b-437b-85cd-7fba0bbea26e' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c' ],
        id: '737017b2-6d95-4918-a64e-61287b694497' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c' ],
        id: '737017b2-6d95-4918-a64e-61287b694497' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c', 'd' ],
        id: '0fe0b994-693c-40ad-aeda-60f9048a2e03' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c', 'd' ],
        id: '0fe0b994-693c-40ad-aeda-60f9048a2e03' }
    ]))
  })

  test('remove duplicates - access via shorter', () => {
    const events = [
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a' ],
        id: 'cdd804c0-49a0-4ca3-8623-5dd2383d337a' },
      { type: 'GET',
        path: [ 'todo', 'a' ],
        id: 'cdd804c0-49a0-4ca3-8623-5dd2383d337a' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b' ],
        id: '0b0dce92-31a9-40fa-8865-b71d000a05d8' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b' ],
        id: '0b0dce92-31a9-40fa-8865-b71d000a05d8' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c' ],
        id: '15de561b-0ec4-448c-825c-d5fb087d8a9b' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c' ],
        id: '15de561b-0ec4-448c-825c-d5fb087d8a9b' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c', 'd' ],
        id: '6ff7380e-1088-4637-b8be-dfe0d1ab5701' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c', 'd' ],
        id: '6ff7380e-1088-4637-b8be-dfe0d1ab5701' }
    ]
    expect(removeDuplicateEvents(events)).toEqual([
      { type: 'GET',
        path: [ 'todo', 'a' ],
        id: 'cdd804c0-49a0-4ca3-8623-5dd2383d337a' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b' ],
        id: '0b0dce92-31a9-40fa-8865-b71d000a05d8' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c' ],
        id: '15de561b-0ec4-448c-825c-d5fb087d8a9b' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c', 'd' ],
        id: '6ff7380e-1088-4637-b8be-dfe0d1ab5701' }
    ])
  })

  test('remove duplicates - access via longer', () => {
    const events = [
      { type: 'GET',
        path: [ 'store', 'todos' ],
        id: 'ccd367ca-fd6e-4400-ab3d-039309ca881f' },
      { type: 'GET',
        path: [ 'store', 'todos', '1' ],
        id: 'bf56cbcb-9d56-4f59-9ea3-4cbcca5d0c9f' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a' ],
        id: '0f10e195-14d1-49a0-99f4-5bc5e7a38108' },
      { type: 'GET',
        path: [ 'todo', 'a' ],
        id: '0f10e195-14d1-49a0-99f4-5bc5e7a38108' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b' ],
        id: '8682c81f-582b-437b-85cd-7fba0bbea26e' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b' ],
        id: '8682c81f-582b-437b-85cd-7fba0bbea26e' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c' ],
        id: '737017b2-6d95-4918-a64e-61287b694497' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c' ],
        id: '737017b2-6d95-4918-a64e-61287b694497' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c', 'd' ],
        id: '0fe0b994-693c-40ad-aeda-60f9048a2e03' },
      { type: 'GET',
        path: [ 'todo', 'a', 'b', 'c', 'd' ],
        id: '0fe0b994-693c-40ad-aeda-60f9048a2e03' }
    ]
    expect(removeDuplicateEvents(events)).toEqual([
      { type: 'GET',
        path: [ 'store', 'todos' ],
        id: 'ccd367ca-fd6e-4400-ab3d-039309ca881f' },
      { type: 'GET',
        path: [ 'store', 'todos', '1' ],
        id: 'bf56cbcb-9d56-4f59-9ea3-4cbcca5d0c9f' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a' ],
        id: '0f10e195-14d1-49a0-99f4-5bc5e7a38108' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b' ],
        id: '8682c81f-582b-437b-85cd-7fba0bbea26e' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c' ],
        id: '737017b2-6d95-4918-a64e-61287b694497' },
      { type: 'GET',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c', 'd' ],
        id: '0fe0b994-693c-40ad-aeda-60f9048a2e03' }
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
      { type: 'DELETE',
        path: [ 'store', 'todos', '1', 'a', 'b', 'c' ],
        val: { d: 'world' }
      },
      { type: 'DELETE',
        path: [ 'todo', 'a', 'b', 'c' ],
        val: { d: 'world' }
      }
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
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['zzz', 'todos'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1'], 'type': 'GET' },
      { 'path': ['todo', 'completed'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'completed'], 'type': 'GET' }
    ])
    expect(events[2].id).toBe(events[3].id)
  })

  test('access via longer one 2', () => {
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
    expect(store.todos[1].title).toBe('222')
    expect(store.todos[1].completed).toBe(false)
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['zzz', 'todos'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'completed'], 'type': 'GET' },
      { 'path': ['todo', 'completed'], 'type': 'GET' }
    ])
    expect(events[2].id).toBe(events[3].id)
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
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['zzz', 'todos'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'completed'], 'type': 'GET' },
      { 'path': ['todo', 'completed'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' }
    ])
    expect(events[2].id).toBe(events[3].id)
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
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['todo', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['todo', 'completed'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'completed'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' }
    ])
    expect(events[0].id).toBe(events[1].id)
  })

  test('access via shorter one 2', () => {
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
    expect(todo.title).toBe('222')
    expect(todo.completed).toBe(false)
    expect(todo.title).toBe('222')
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'completed'], 'type': 'GET' },
      { 'path': ['todo', 'completed'], 'type': 'GET' },
      { 'path': ['zzz', 'todos', '1', 'title'], 'type': 'GET' },
      { 'path': ['todo', 'title'], 'type': 'GET' }])
    expect(events[0].id).toBe(events[1].id)
  })
})
