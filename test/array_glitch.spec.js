/* eslint-env jest */
import { bufferTime, windowTime, throttleTime, bufferToggle, buffer, debounceTime } from 'rxjs/operators'
import { timer } from 'rxjs'
import delay from 'timeout-as-promise'

import SubX from '../src/index'

describe('array glitch', () => {
  test('default', () => {
    const p = SubX.create([1, 2, 3])
    let json
    const sub = p.$.subscribe(e => {
      json = JSON.stringify(p)
      sub.unsubscribe()
    })
    p.splice(1, 1)
    expect(json).toBe('[1,3,3]') // intermediate value, invalid
  })

  test('bufferTime', async () => {
    const p = SubX.create([1, 2, 3])
    const events = []
    p.$.pipe(
      bufferTime(6)
    ).subscribe(e => {
      events.push(e)
    })
    p.splice(1, 1)
    await delay(17)
    expect(events.length).toBe(2) // emits new array every time frame, no matter there is event or not
    expect(events[1]).toEqual([]) // bufferTime emits empty array when there is no events
  })

  test('windowTime', async () => {
    const p = SubX.create([1, 2, 3])
    const streams = []
    p.$.pipe(
      windowTime(6)
    ).subscribe(e => {
      streams.push(e)
    })
    p.splice(1, 1)
    await delay(17)
    expect(streams.length).toBe(3) // // emits new stream every time frame, no matter there is event or not
    const events = []
    streams[2].subscribe(e => events.push(e))
    expect(events).toEqual([]) // windowTime emits empty stream when there is no events
  })

  test('bufferToggle', async () => {
    const p = SubX.create([1, 2, 3])
    const events = []
    p.$.pipe(
      bufferToggle(p.$.pipe(throttleTime(6)), () => timer(6))
    ).subscribe(e => events.push(e))
    p.splice(1, 1)
    await delay(17)
    expect(events.length).toBe(1) // one buffered event only
    expect(events[0].length).toBeGreaterThan(1) // event is a buffered event
  })

  test('buffer', async () => {
    const p = SubX.create([1, 2, 3])
    const events = []
    p.$.pipe(
      buffer(p.$.pipe(debounceTime(5)))
    ).subscribe(e => events.push(e))
    p.splice(1, 1)
    await delay(10)
    expect(events.length).toBe(1) // one buffered event only
    expect(events[0].length).toBeGreaterThan(1) // event is a buffered event
  })
})
