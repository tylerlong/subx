/* eslint-env jest */
import SubX from '../src/index'
import computed from '../src/computed'

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
})
