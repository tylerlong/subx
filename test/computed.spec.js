/* eslint-env jest */
import * as R from 'ramda'

const computed = (o, f) => {
  const cache = {}
  const dependencies = {}
  const temp = function (...args) {
    if (!(args in cache) || R.pipe(R.keys, R.any(key => dependencies[key] !== o[key]))(dependencies)) {
      const proxy = new Proxy(o, {
        get: (target, prop, receiver) => {
          dependencies[prop] = target[prop]
          return target[prop]
        }
      })
      cache[args] = f.bind(proxy)(...args)
    }
    return cache[args]
  }
  return temp
}

describe('mobx', () => {
  test('default', () => {
    let count = 0
    const o = {
      a: 1,
      b: 2,
      c () {
        console.log('inside')
        count += 1
        return this.a + this.b
      }
    }
    o.c = computed(o, o.c)
    console.log(o.c())
    console.log(o.c())

    console.log(o.c(1))
    console.log(o.c(1))

    o.a = 2
    console.log(o.c(1))
    console.log(o.c(1))

    expect(count).toBe(3)
  })
})
