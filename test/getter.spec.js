/* eslint-env jest */
import SubX from '../src/index'

describe('getter', () => {
  test('default', () => {
    const o = {
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        return `${this.firstName} ${this.lastName}`
      }
    }
    const p = {
      firstName: 'Tyler',
      lastName: 'Liu'
    }
    expect(o.fullName).toBe('Tyler Liu')
    Object.defineProperty(p, 'fullName', Object.getOwnPropertyDescriptor(o, 'fullName'))
    expect(p.fullName).toBe('Tyler Liu')
    expect('get' in Object.getOwnPropertyDescriptor(p, 'fullName')).toBeTruthy()
    expect('value' in Object.getOwnPropertyDescriptor(p, 'fullName')).toBeFalsy()
  })
  test('subx', () => {
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        return `${this.firstName} ${this.lastName}`
      },
      fullName2 () {
        return `${this.firstName} ${this.lastName}`
      }
    })
    expect(p.fullName).toBe('Tyler Liu')
    expect('get' in Object.getOwnPropertyDescriptor(p, 'fullName')).toBeTruthy()
    expect('value' in Object.getOwnPropertyDescriptor(p, 'fullName')).toBeFalsy()
    expect('get' in Object.getOwnPropertyDescriptor(p, 'fullName2')).toBeFalsy()
    expect('value' in Object.getOwnPropertyDescriptor(p, 'fullName2')).toBeTruthy()
  })
  test('subx compuated cache', () => {
    let count1 = 0
    let count2 = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        count1 += 1
        return `${this.firstName} ${this.lastName}`
      },
      fullName2 () {
        count2 += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    expect(p.fullName).toBe('Tyler Liu')
    expect(p.fullName).toBe('Tyler Liu')
    expect(count1).toBe(1) // has cache
    expect(p.fullName2()).toBe('Tyler Liu')
    expect(p.fullName2()).toBe('Tyler Liu')
    expect(count2).toBe(2) // no cache
  })
})
