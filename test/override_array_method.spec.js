/* eslint-env jest */
describe('override array method', () => {
  test('unshift', () => {
    const a = [1, 2, 3]
    a.unshift(0)
    expect(a).toEqual([0, 1, 2, 3])
  })

  test('override unshift', () => {
    const a = [1, 2, 3]
    const handler = {
      get: (target, prop, receiver) => {
        if (prop === 'unshift') {
          const f = (...args) => {
            const r = target[prop].bind(receiver)(...args)
            return r
          }
          return f
        }
        return target[prop]
      }
    }
    const p = new Proxy(a, handler)
    p.unshift(0)
    expect(p).toEqual([0, 1, 2, 3])
  })
})
