/* eslint-env jest */
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
    // https://github.com/nodejs/node/issues/31989
    // expect(store[util.inspect.custom]()).toEqual({
    //   todos: [{
    //     title: '111',
    //     completed: false
    //   }],
    //   visibility: 'all'
    // })
    expect(JSON.stringify(store.toJSON())).toBe('{"todos":[{"title":"111","completed":false}],"visibility":"all"}')
    expect(JSON.stringify(store)).toBe('{"todos":[{"title":"111","completed":false}],"visibility":"all"}')
  })

  test('methods', () => {
    const bot = SubX.create({
      id: '123',
      async authorize () {
        console.log('authorize')
      },
      add () {
        this.id = '234'
      },
      get sum () {
        return 5
      }
    })
    expect(bot.toJSON()).toEqual({ id: '123' })
  })
})
