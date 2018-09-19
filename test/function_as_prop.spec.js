/* eslint-env jest */
import SubX from '../src/index'
import uuid from 'uuid/v1'

describe('function as prop', () => {
  test('uuid', () => {
    const Person = new SubX({
      firstName: '',
      lastName: ''
    })
    const person1 = new Person({
      id: uuid(),
      firstName: 'San',
      lastName: 'Zhang'
    })
    const person2 = new Person({
      id: uuid(),
      firstName: 'Si',
      lastName: 'Li'
    })
    expect(person1.firstName).toBe('San')
    expect(person2.lastName).toBe('Li')

    expect(typeof person1.id).toBe('string')
    expect(typeof person2.id).toBe('string')
    expect(person1.id).not.toEqual(person2.id)
  })
})
