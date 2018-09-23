/* eslint-env jest */
import * as R from 'ramda'
import { filter } from 'rxjs/operators'

import SubX from '../src/index'

const computed = (subx, f) => {
  let cache
  let changed = true
  const wrapped = () => {
    if (changed) {
      const gets = []
      const subscriptions = []
      subscriptions.push(subx.get$.subscribe(event => gets.push(event)))
      cache = f.bind(subx)()
      changed = false
      R.forEach(subscription => subscription.unsubscribe(), subscriptions)

      if (gets.length > 0) {
        const relevantGets = R.reduce((events, event) => {
          if (events.length > 0 && R.startsWith(events[0].path, event.path)) {
            events.shift()
          }
          events.unshift(event)
          return events
        }, [], gets)
        const changeSubscription = subx.$.pipe(
          filter(event => R.any(rGet => R.equals(rGet.path, event.path), relevantGets))
        ).subscribe(event => {
          changed = true
          changeSubscription.unsubscribe()
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
  test('delete trigger re-compute', () => {
    let count = 0
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      fullName: function () {
        count += 1
        return `${this.firstName} ${this.lastName}`
      }
    })
    const f = computed(p, p.fullName)
    expect(f()).toBe('Tyler Liu')
    expect(f()).toBe('Tyler Liu')
    expect(count).toBe(1)
    delete p.lastName
    expect(f()).toBe('Tyler undefined')
    expect(f()).toBe('Tyler undefined')
    expect(count).toBe(2)
  })
})
