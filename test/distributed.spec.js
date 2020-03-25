/* eslint-env jest */
import SubX from '../src/index'

describe('distributed', () => {
  test('default test', () => {
    // user.js
    let count1 = 0
    const User = new SubX({
      firstName: 'San',
      lastName: 'Zhang',
      get name () {
        count1 += 1
        return `${this.firstName} ${this.lastName}`
      }
    })

    // company.js
    let count2 = 0
    const Company = new SubX({
      email: 'test@example.com',
      phone: '13888888888',
      get contact () {
        count2 += 1
        return `${this.email} ${this.phone}`
      }
    })
    // store.js
    const Store = new SubX({
      user: new User(),
      company: new Company()
    })

    // index.js
    const store = new Store()
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
