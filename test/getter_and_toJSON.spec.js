/* eslint-env jest */
import util from 'util'

import SubX from '../src/index'

describe('getter & toJSON', () => {
  test('default', () => {
    let count = 0
    const o = {
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    }
    // getter function and its result is included in JSON
    expect(JSON.stringify(o, null, 2)).toContain('"fullName": "Tyler Liu"')
    expect(count).toBe(1)
  })

  test('inspect', () => {
    let count = 0
    const o = {
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      },
      nested: {
        a: {
          b: 'hello world'
        }
      }
    }
    expect(util.inspect(o)).toEqual(`{ firstName: 'Tyler',
  lastName: 'Liu',
  fullName: [Getter],
  nested: { a: { b: 'hello world' } } }`
    )
    expect(count).toBe(0)
  })

  test('SubX inspect', () => {
    let count = 0
    const o = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      },
      nested: {
        a: {
          b: 'hello world'
        }
      }
    })
    expect(util.inspect(o)).toEqual(`{ firstName: 'Tyler',
  lastName: 'Liu',
  fullName: [Getter],
  nested: { a: { b: 'hello world' } } }`
    )
    expect(count).toBe(0)
  })
})
