/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('null value', () => {
  test('should allow null assign', () => {
    const person = SubX.create({})

    const events = []
    person.$.subscribe(event => {
      events.push(event)
    })

    person.name = 'hello'
    person.name = null

    expect(R.map(R.dissoc('id'), events)).toEqual([
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
