/* eslint-env jest */
import * as R from 'ramda'
import { filter } from 'rxjs/operators'

import SubX from '../src/index'

const computed = (subx, f) => {
  let cache
  let changed = true
  const wrapped = () => {
    if (changed) {
      const getEvents = []
      const getSub = subx.get$.subscribe(event => getEvents.push(event))

      cache = f.bind(subx)()
      changed = false

      getSub.unsubscribe()
      if (getEvents.length > 0) {
        const compactEvents = R.reduce((events, event) => {
          if (events.length > 0 && R.startsWith(events[0].path, event.path)) {
            events.shift()
          }
          events.unshift(event)
          return events
        }, [], getEvents)
        const changeSub = subx.$.pipe(filter(event => R.any(ce => R.equals(ce.path, event.path), compactEvents))).subscribe(event => {
          changed = true
          changeSub.unsubscribe()
        })
      }
    }
    return cache
  }
  return wrapped
}

describe('SubX computed', () => {
  test('cache', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      age: 30,
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
  })
  test('re-compute', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      age: 30,
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
    p.firstName = 'Peter'
    expect(f()).toBe('Peter Liu')
    expect(f()).toBe('Peter Liu')
    expect(count).toBe(2)
  })
  test('cache by correct key', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      age: 30,
      fullName: function () {
        count += 1
        return `${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Liu')
    expect(f()).toBe('Liu')
    expect(count).toBe(1)
    p.age = 20
    expect(f()).toBe('Liu')
    expect(count).toBe(1)
    p.firstName = 'Peter'
    expect(f()).toBe('Liu')
    expect(count).toBe(1)
    p.lastName = 'Lau'
    expect(f()).toBe('Lau')
    expect(count).toBe(2)
  })
})
