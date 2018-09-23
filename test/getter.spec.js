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
      }
    })
    expect(p.fullName).toBe('Tyler Liu')
    expect('get' in Object.getOwnPropertyDescriptor(p, 'fullName')).toBeTruthy()
    expect('value' in Object.getOwnPropertyDescriptor(p, 'fullName')).toBeFalsy()
  })
})
