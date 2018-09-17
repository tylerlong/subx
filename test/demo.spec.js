/* eslint-env jest */
import { filter } from 'rxjs/operators'

import SubX from '../src/index'

describe('demo', () => {
  test('props changed events', () => {
    const Person = new SubX({
      firstName: '',
      lastName: ''
    })
    const person = new Person({
      firstName: 'San',
      lastName: 'Zhang'
    })
    person.$.pipe(filter(action => action.prop === 'firstName')).subscribe(mutation => {
      console.log('First name changed', mutation)
    })
    person.$.pipe(filter(action => action.prop === 'lastName')).subscribe(mutation => {
      console.log('Last name changed', mutation)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })

  test('Subscribe to all the props changed events', () => {
    const Person = new SubX({
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

  test('simplest demo', () => {
    const person = SubX.create({
      firstName: 'San',
      lastName: 'Zhang'
    })
    person.$.subscribe(action => {
      console.log('Property changed', action)
    })
    person.firstName = 'Si'
    person.lastName = 'Li'
    person.lastName = 'Wang'
    person.firstName = 'Wu'
  })
})
