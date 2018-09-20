/* eslint-env jest */
import SubX from '../src/index'
import './benchmark'

describe('null value', () => {
  test('should allow null assign', () => {
    const person = SubX.create({})

    const events1 = []
    person.$.subscribe(event => {
      events1.push(event)
    })
    const events2 = []
    person.$$.subscribe(event => {
      events2.push(event)
    })

    person.name = 'hello'
    person.name = null

    expect(events1).toEqual([
      {
        type: 'SET',
        path: ['name'],
        val: 'hello',
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['name'],
        val: null,
        oldVal: 'hello'
      }
    ])

    expect(events2).toEqual([
      {
        type: 'SET',
        path: ['name'],
        val: 'hello',
        oldVal: undefined
      },
      {
        type: 'SET',
        path: ['name'],
        val: null,
        oldVal: 'hello'
      }
    ])
  })
})
