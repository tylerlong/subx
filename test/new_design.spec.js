/* eslint-env jest */
import { Subject } from 'rxjs'
import * as R from 'ramda'

const handler = {
  set: (target, property, value, receiver) => {
    // const oldVal = target[property]
    target[property] = value
    if ('$' in target) {
      target.$.next({
        // target,
        prop: property,
        val: value
        // oldVal
      })
    }
    return true
  },
  get: (target, property, receiver) => {
    if (property === 'toJSON') {
      return () => R.dissoc('$', target)
    }
    if (property === '$' && !('$' in target)) {
      target.$ = new Subject()
    }
    return target[property]
  }
}

// const subx = (obj = {}) => {
//   return new Proxy(obj, handler)
// }

class SubX extends Proxy {
  constructor (target) {
    super(target, handler)
  }
}

describe('new design', () => {
  test('prototype', () => {
    const p = new SubX({ hello: 'world' })

    p.$.subscribe(mutation => {
      console.log('1:', mutation)
    })
    p.firstName = 'Si'
    p.lastName = 'Li'

    p.$.subscribe(mutation => {
      console.log('2:', mutation)
    })
    p.firstName = 'Wu'
    p.lastName = 'Wang'

    // console.log(JSON.stringify(p, (k, v) => k === '$' ? undefined : v, 2))
    // console.log(JSON.stringify(p, null, 2))
    console.log(p.toJSON())
  })

  // test('array', () => {
  //   const a = subx([])
  //   a.$.subscribe(mutation => {
  //     console.log(mutation)
  //   })
  //   a.push(1)
  //   a.push(2)
  //   console.log(typeof a)
  //   a[1] = 3
  //   a.unshift()
  // })

  // test('nested', () => {
  //   const n = subx({})
  //   n.a = {}
  //   n.a.$.subscribe(mutation => {
  //     console.log(mutation)
  //   })
  //   n.a.b = 'hello'
  // })
})
