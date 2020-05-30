/* eslint-env jest */
import SubX from '../build/index'

describe('distributed', () => {
  test('default test', () => {
    // user.js
    let count1 = 0
    const User = SubX.model({
      firstName: 'San',
      lastName: 'Zhang',
      get name () {
        count1 += 1
        return `${this.firstName} ${this.lastName}`
      }
    })

    // company.js
    let count2 = 0
    const Company = SubX.model({
      email: 'test@example.com',
      phone: '13888888888',
      get contact () {
        count2 += 1
        return `${this.email} ${this.phone}`
      }
    })
    // store.js
    const Store = SubX.model({
      user: User.create(),
      company: Company.create()
    })

    // index.js
    const store = Store.create()
    expect(store.user.name).toBe('San Zhang')
    expect(store.company.contact).toBe('test@example.com 13888888888')
    expect(count1).toBe(1)
    expect(count2).toBe(1)
    expect(store.user.name).toBe('San Zhang')
    expect(store.company.contact).toBe('test@example.com 13888888888')
    expect(count1).toBe(1)
    expect(count2).toBe(1)
  })
})
