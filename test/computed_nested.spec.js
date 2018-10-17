/* eslint-env jest */
import SubX from '../src/index'
import { computed } from '../src/monitor'

describe('computed nested', () => {
  test('default', () => {
    let count = 0
    const p = SubX.create({
      a: {
        b: {
          c: function () {
            count += 1
            return `${this.d.e.f.g} ${this.d.e.f.h}`
          }
        }
      },
      d: {
        e: {
          f: {
            g: 1,
            h: 2
          }
        }
      }
    })
    const f = computed(p, p.a.b.c)
    expect(f()).toBe(`1 2`)
    expect(f()).toBe(`1 2`)
    expect(count).toBe(1)
    p.d.e.f.g = 3
    expect(f()).toBe(`3 2`)
    expect(f()).toBe(`3 2`)
    expect(count).toBe(2)
    p.d.e.f = {
      g: 3,
      h: 2
    }
    expect(f()).toBe(`3 2`)
    expect(f()).toBe(`3 2`)
    expect(count).toBe(2)
    p.d.e.f.h = 2
    expect(f()).toBe(`3 2`)
    expect(f()).toBe(`3 2`)
    expect(count).toBe(2)
    p.d.e.f.h = 4
    expect(f()).toBe(`3 4`)
    expect(f()).toBe(`3 4`)
    expect(count).toBe(3)
    delete p.d.e.f.g
    expect(f()).toBe(`undefined 4`)
    expect(f()).toBe(`undefined 4`)
    expect(count).toBe(4)
  })
})
