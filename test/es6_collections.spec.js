/* eslint-env jest */
describe('ES6 collections', () => {
  test('Map', () => {
    const m = new Map()
    m.set('a', 1)
    m.b = 2
    expect(m.get('a')).toBe(1)
    expect(m.get('b')).toBeUndefined()
    expect(m.b).toBe(2)
    expect(m.a).toBeUndefined()
    expect(Object.keys(m)).toEqual(['b'])
    expect(JSON.stringify(m)).toBe('{"b":2}')
  })

  test('Map & proxy', () => {
    const m = new Map()
    m.set('c', 3)
    const gets = []
    const sets = []
    const handler = {
      get: (target, prop, receiver) => {
        gets.push(prop)
        return target[prop]
      },
      set: (target, prop, val, receiver) => {
        sets.push(prop)
        target[prop] = val
        return true
      }
    }
    const p = new Proxy(m, handler)
    p.a = 1
    expect(p.a).toBe(1)
    p.set.bind(m)('b', 2)
    expect(p.get.bind(m)('b')).toBe(2)
    expect(gets).toEqual(['a', 'set', 'get'])
    expect(sets).toEqual(['a'])
  })
})
