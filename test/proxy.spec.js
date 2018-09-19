/* eslint-env jest */
import * as R from 'ramda'

describe('test', () => {
  test('proxy for object properties', () => {
    let count = 0
    const handler = {
      set: (target, property, value, receiver) => {
        count += 1
        target[property] = value
        // console.log('prop changed')
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
    person.firstName = 'Chuntao'
    expect(count).toBe(1) // assign to target doesn't invoke handler.set
  })
  test('proxy for array', () => {
    const handler = {
      deleteProperty: function (target, property) {
        delete target[property]
        // console.log('Deleted %s', property)
        return true
      },
      set: function (target, property, value, receiver) {
        target[property] = value
        // console.log('Set %s to %o', property, value)
        return true
      }
    }
    const a = [1, 2, 3, 4, 5, 6]
    const p = new Proxy(a, handler)
    p[1] = 100
    // console.log(p)
    p.push(7)
    // console.log(p)
    p.splice(1, 3)
    // console.log(p)
  })
  test('delete obj property', () => {
    const handler = {
      deleteProperty: function (target, property) {
        expect(R.keys(target).length).toBe(3) // deletion hasn't performed
        // console.log('Deleted %s', property)
        delete target[property]
        return true
      },
      set: function (target, property, value, receiver) {
        target[property] = value
        // console.log('Set %s to %o', property, value)
        return true
      }
    }
    const p = new Proxy({ a: 1, b: 2, c: {} }, handler)
    delete p.b
    p.c = 4 // this doesn't trigger delete c first
  })
  test('delete array elements', () => {
    const handler = {
      deleteProperty: function (target, property) {
        // console.log('Deleted %s', property)
        delete target[property]
        return true
      },
      set: function (target, property, value, receiver) {
        target[property] = value
        // console.log('Set %s to %o', property, value)
        return true
      }
    }
    const p = new Proxy([1, 2, 3], handler)
    delete p[1]
    // console.log(p)
    p.shift()
    // console.log(p)
  })
})
