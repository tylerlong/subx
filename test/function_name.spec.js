/* eslint-env jest */
describe('function name', () => {
  test('default', () => {
    const p = {
      g: function () {
      }
    }

    const computed = (o, f) => {
      expect(f.name).toBe('g')
    }

    computed(p, p.g)
  })

  test('default 2', () => {
    const p = {
      g () {
      }
    }

    const computed = (o, f) => {
      expect(f.name).toBe('g')
    }

    computed(p, p.g)
  })
})
