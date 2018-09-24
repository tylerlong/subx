/* eslint-env jest */
describe('setter', () => {
  test('default', () => {
    const o = { firstName: 'Tyler', lastName: 'Liu' }
    Object.defineProperty(o, 'fullName', {
      get: function () {
        return `${this.firstName} ${this.lastName}`
      },
      set: function (val) {
        [this.firstName, this.lastName] = val.split(' ')
      }
    })
    o.fullName = 'San Zhang'
    expect(o.firstName).toBe('San')
    expect(o.lastName).toBe('Zhang')
  })

  test('proxy traps', () => {
    const o = { firstName: 'Tyler', lastName: 'Liu' }
    Object.defineProperty(o, 'fullName', {
      get: function () {
        return `${this.firstName} ${this.lastName}`
      },
      set: function (val) {
        const [firstName, lastName] = val.split(' ')
        this.firstName = firstName
        this.lastName = lastName
      }
    })
    const gets = []
    const sets = []
    const handler = {
      get: (target, prop, receiver) => {
        gets.push(`get ${prop}`)
        return target[prop]
      },
      set: (target, prop, val, receiver) => {
        sets.push(`${prop} = ${val}`)
        target[prop] = val
        return true
      }
    }
    const p = new Proxy(o, handler)
    expect(p.fullName).toBe('Tyler Liu')
    expect(gets).toEqual(['get fullName']) // doesn't trigger firstName get or lastName get
    p.fullName = 'San Zhang'
    expect(p.firstName).toBe('San')
    expect(p.lastName).toBe('Zhang')
    expect(sets).toEqual(['fullName = San Zhang']) // doesn't trigger firstName set or lastName set
  })

  test('proxy traps 2', () => {
    const o = { firstName: 'Tyler', lastName: 'Liu' }
    const gets = []
    const sets = []
    const handler = {
      get: (target, prop, receiver) => {
        gets.push(`get ${prop}`)
        return target[prop]
      },
      set: (target, prop, val, receiver) => {
        sets.push(`${prop} = ${val}`)
        target[prop] = val
        return true
      }
    }
    const p = new Proxy(o, handler)
    Object.defineProperty(p, 'fullName', {
      get: function () {
        return `${this.firstName} ${this.lastName}`
      },
      set: function (val) {
        const [firstName, lastName] = val.split(' ')
        this.firstName = firstName
        this.lastName = lastName
      }
    })
    expect(p.fullName).toBe('Tyler Liu')
    expect(gets).toEqual(['get fullName']) // doesn't trigger firstName get or lastName get
    p.fullName = 'San Zhang'
    expect(p.firstName).toBe('San')
    expect(p.lastName).toBe('Zhang')
    expect(sets).toEqual(['fullName = San Zhang']) // doesn't trigger firstName set or lastName set
  })
})
