/* eslint-env jest */
import SubX from '../src/index'
import * as R from 'ramda'

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

    const events = []
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
    expect(R.map(R.dissoc('id'), events)).toEqual([
      { type: 'GET',
        path: [ 'zzz', 'todos' ]
      },
      { type: 'GET',
        path: [ 'zzz', 'todos', '1' ]
      },
      { type: 'GET',
        path: [ 'zzz', 'todos', '1', 'title' ]
      },
      { type: 'GET',
        path: [ 'todo', 'title' ]
      }
    ])
    expect(events[2].id).toBe(events[3].id)
  })
})
