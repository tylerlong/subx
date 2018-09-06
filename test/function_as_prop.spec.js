/* eslint-env jest */
import SubX from '../src/index'

describe('function as prop', () => {
  test('uuid', () => {
    const Person = SubX({
      firstName: '',
      lastName: ''
    })
    const person1 = new Person({
      firstName: 'San',
      lastName: 'Zhang'
    })
    const person2 = new Person({
      firstName: 'Si',
      lastName: 'Li'
    })
    expect(person1.firstName).toBe('San')
    expect(person2.lastName).toBe('Li')
  })
})
