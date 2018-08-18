/* eslint-env jest */
import SubX from '../src/index'

describe('computed properties', () => {
  test('demo', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    }).computed({
      fullName: function () { return `${this.firstName} ${this.lastName}` }
    })
    const person = new Person()
    expect(person.fullName()).toBe('San Zhang')

    person.firstName = 'Si'
    person.lastName = 'Li'
    expect(person.fullName()).toBe('Si Li')

    person.lastName = 'Wang'
    person.firstName = 'Wu'
    expect(person.fullName()).toBe('Wu Wang')
  })
})
