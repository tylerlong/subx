/* eslint-env jest */

const computed = f => {
  let cache
  const temp = function (...args) {
    if (!cache) {
      cache = f(...args)
    }
    return cache
  }
  return temp
}

describe('mobx', () => {
  test('default', () => {
    const o = {
      a: 1,
      b: 2,
      c () {
        console.log('inside')
        return this.a + this.b
      }
    }
    o.c = computed(o.c.bind(o))
    console.log(o.c())
    console.log(o.c())
    console.log(o.c())
  })
})
