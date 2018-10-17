/* eslint-env jest */
import util from 'util'

import SubX from '../src/index'

describe('toJSON', () => {
  test('default', () => {
    const store = SubX.create({
      todos: [{
        title: '111',
        completed: false
      }],
      visibility: 'all'
    })
    expect(store).toEqual({
      todos: [{
        title: '111',
        completed: false
      }],
      visibility: 'all'
    })
    expect(store[util.inspect.custom]()).toEqual({
      todos: [{
        title: '111',
        completed: false
      }],
      visibility: 'all'
    })
    expect(JSON.stringify(store.toJSON())).toBe('{"todos":[{"title":"111","completed":false}],"visibility":"all"}')
    expect(JSON.stringify(store)).toBe('{"todos":[{"title":"111","completed":false}],"visibility":"all"}')
  })
})
