/* eslint-env jest */
import { Subject, from, fromEvent, Subscription } from 'rxjs'
import { map } from 'rxjs/operators'
import EventEmitter from 'events'

describe('monitor subscribers', () => {
  test('default', () => {
    const s = new Subject()
    expect(s.observers.length).toBe(0)
    s.subscribe(e => {})
    expect(s.observers.length).toBe(1)
    s.pipe(map(e => e)).subscribe(e => {})
    expect(s.observers.length).toBe(2)
    const temp$ = s.pipe(map(e => e))
    temp$.subscribe(e => {})
    expect(s.observers.length).toBe(3)
  })

  test('get & set observers', () => {
    const s = new Subject()
    expect(s.observers).toEqual([])
    const observers = []
    s.observers = observers
    s.subscribe(e => {})
    expect(s.observers.length).toBe(1)
    expect(observers.length).toBe(1)
  })

  test('observable observers', () => {
    const o = from([1, 2, 3])
    expect(o.observers).toBeUndefined()
  })

  test('fromEvent observers', () => {
    const emitter = new EventEmitter()
    const o = fromEvent(emitter, 'msg')
    expect(o.observers).toBeUndefined()
  })

  test('monitor observers', () => {
    const s = new Subject()
    let add = 0
    let remove = 0
    s.observers = new Proxy([], {
      set: (target, prop, val, receiver) => {
        if (prop === 'length') {
          if (val === target[prop]) {
            add += 1
          } else {
            remove += 1
          }
        }
        target[prop] = val
        return true
      }
    })
    const subscription = new Subscription()
    expect(add).toBe(0)
    expect(remove).toBe(0)
    subscription.add(s.subscribe(e => {}))
    expect(add).toBe(1)
    expect(remove).toBe(0)
    subscription.add(s.subscribe(e => {}))
    expect(add).toBe(2)
    expect(remove).toBe(0)
    subscription.unsubscribe()
    expect(add).toBe(2)
    expect(remove).toBe(2)
  })

  test('observers stream', () => {
    const s = new Subject()
    s.observers = new Proxy([], {
      get: (target, prop, receiver) => {
        if (prop === '$' && !target.$) {
          target.$ = new Subject()
        }
        return target[prop]
      },
      set: (target, prop, val, receiver) => {
        if (prop === 'length') {
          if (val === 1 && val === target[prop]) {
            if (target.$) {
              target.$.next(true)
            }
          } else if (val === 0) {
            if (target.$) {
              target.$.next(false)
            }
          }
        }
        target[prop] = val
        return true
      }
    })

    const events = []
    s.observers.$.subscribe(e => events.push(e))
    expect(events).toEqual([])
    const subscription = s.subscribe(e => {})
    expect(events).toEqual([true])
    subscription.unsubscribe()
    expect(events).toEqual([true, false])
  })
})
