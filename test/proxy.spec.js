/* eslint-env jest */
describe('test', () => {
  test('proxy for object properties', () => {
    let count = 0
    const handler = {
      set: (target, property, value, receiver) => {
        count += 1
        target[property] = value
        console.log('prop changed')
        return true
      }
    }
    const person = {
      firstName: 'San',
      lastName: 'Zhang'
    }
    const p = new Proxy(person, handler)
    p.firstName = 'Si'
    person.firstName = 'Wu'
    expect(count).toBe(1)
  })
  test('proxy for array', () => {
    const handler = {
      apply: function (target, thisArg, argumentsList) {
        console.log('Apply')
        return thisArg[target].apply(this, argumentsList)
      },
      deleteProperty: function (target, property) {
        console.log('Deleted %s', property)
        return true
      },
      set: function (target, property, value, receiver) {
        target[property] = value
        console.log('Set %s to %o', property, value)
        return true
      }
    }
    const a = [1, 2, 3, 4, 5, 6]
    const p = new Proxy(a, handler)
    p[1] = 100
    console.log(p)
    p.push(7)
    console.log(p)
    p.splice(1, 3)
    console.log(p)
  })
})
