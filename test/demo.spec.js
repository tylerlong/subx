/* eslint-env jest */
import SubX from '../src/index'

describe('demo', () => {
  test('props changed events', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    })
    const person = new Person()
    person.firstName$.subscribe(mutation => {
      console.log('First name changed', mutation)
    })
    person.lastName$.subscribe(mutation => {
      console.log('Last name changed', mutation)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })

  test('Subscribe to all the props changed events', () => {
    const Person = SubX({
      firstName: 'San',
      lastName: 'Zhang'
    })
    const person = new Person()
    person.$.subscribe(mutation => {
      console.log('Prop changed', mutation)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })
})
