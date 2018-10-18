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
    s.observers = new Proxy([], {
      set: (target, prop, val, receiver) => {
        if (prop === 'length') {
          console.log('observers ' + (val === target[prop] ? 'added' : 'removed'))
        }
        target[prop] = val
        return true
      }
    })
    const subscription = new Subscription()
    subscription.add(s.subscribe(e => {}))
    subscription.add(s.subscribe(e => {}))
    subscription.unsubscribe()
  })
})
