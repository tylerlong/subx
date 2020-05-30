/* eslint-env jest */
import SubX from '../build/index'
import { computed } from '../build/monitor'

describe('SubX computed', () => {
  test('cache', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
  })

  test('re-compute', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
    p.firstName = 'Peter'
    expect(f()).toBe('Peter Liu')
    expect(f()).toBe('Peter Liu')
    expect(count).toBe(2)
  })

  test('cache by correct key', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      age: 30,
      fullName: function () {
        count += 1
        return `${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Liu')
    expect(f()).toBe('Liu')
    expect(count).toBe(1)
    p.age = 20
    expect(f()).toBe('Liu')
    expect(count).toBe(1)
    p.firstName = 'Peter'
    expect(f()).toBe('Liu')
    expect(count).toBe(1)
    p.lastName = 'Lau'
    expect(f()).toBe('Lau')
    expect(count).toBe(2)
  })

  test('delete trigger re-compute', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
    delete p.lastName
    expect(f()).toBe('Tyler undefined')
    expect(f()).toBe('Tyler undefined')
    expect(count).toBe(2)
  })

  test('nothing change assignment won\'t trigger re-compute', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
    p.firstName = 'Peter'
    expect(f()).toBe('Peter Liu')
    expect(f()).toBe('Peter Liu')
    expect(count).toBe(2)
    p.firstName = 'Peter'
    expect(f()).toBe('Peter Liu')
    expect(f()).toBe('Peter Liu')
    expect(count).toBe(2) // still 2
    p.lastName = 'Liu'
    expect(f()).toBe('Peter Liu')
    expect(f()).toBe('Peter Liu')
    expect(count).toBe(2) // still 2
    p.firstName = 'Tyler'
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(3)
  })

  test('has cache', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${'lastName' in this ? 'has last name' : 'no last name'}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler has last name')
    expect(f()).toBe('Tyler has last name')
    expect(count).toBe(1)
    delete p.lastName
    expect(f()).toBe('Tyler no last name')
    expect(f()).toBe('Tyler no last name')
    expect(count).toBe(2)
  })

  test('has cache undefined', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: undefined,
      fullName: function () {
        count += 1
        return `${this.firstName} ${'lastName' in this ? 'has last name' : 'no last name'}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler has last name') // undefined is his last name
    expect(f()).toBe('Tyler has last name')
    expect(count).toBe(1)
    delete p.lastName
    expect(f()).toBe('Tyler no last name')
    expect(f()).toBe('Tyler no last name')
    expect(count).toBe(2)
  })

  test('delete non-exist doesn\'t trigger re-compute', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${'middleName' in this ? 'has middle name' : 'no middle name'}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler no middle name')
    expect(f()).toBe('Tyler no middle name')
    expect(count).toBe(1)
    delete p.middleName
    expect(f()).toBe('Tyler no middle name')
    expect(f()).toBe('Tyler no middle name')
    expect(count).toBe(1)
    p.middleName = 'chun'
    expect(f()).toBe('Tyler has middle name')
    expect(f()).toBe('Tyler has middle name')
    expect(count).toBe(2)
  })

  test('keys cache', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      names: function () {
        count += 1
        return `I have ${Object.keys(this).join(', ')}`
      }
    })
    const f = computed(p, p.names)
    expect(f()).toBe('I have firstName, lastName, names')
    expect(f()).toBe('I have firstName, lastName, names')
    expect(count).toBe(1)
    p.firstName = 'Peter'
    expect(f()).toBe('I have firstName, lastName, names')
    expect(f()).toBe('I have firstName, lastName, names')
    expect(count).toBe(1)
    p.middleName = 'Chun'
    expect(f()).toBe('I have firstName, lastName, names, middleName')
    expect(f()).toBe('I have firstName, lastName, names, middleName')
    expect(count).toBe(2)
  })
})
