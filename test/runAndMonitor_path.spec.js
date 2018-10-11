/* eslint-env jest */
import SubX, { runAndMonitor } from '../src/index'

describe('runAndMonitor path', () => {
  test('root is subx', () => {
    const p = SubX.create({
      number: 1
    })
    const stream = runAndMonitor(p, () => p.number).stream
    let events = []
    stream.subscribe(e => events.push(e))
    p.number = 2
    expect(events).toEqual([{ type: 'SET', path: [ 'number' ], val: 2, oldVal: 1 }])
  })
  test('root is not subx', () => {
    const p = SubX.create({
      number: 1
    })
    const stream = runAndMonitor({ child: p }, () => p.number).stream
    let events = []
    stream.subscribe(e => events.push(e))
    p.number = 2
    expect(events).toEqual([{ type: 'SET', path: [ 'child', 'number' ], val: 2, oldVal: 1 }])
  })
})
