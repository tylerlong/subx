/* eslint-env jest */
import * as R from 'ramda'

import SubX from '../src/index'

describe('runAndMonitor path', () => {
  test('root is subx', () => {
    const p = SubX.create({
      number: 1
    })
    const stream = SubX.runAndMonitor(p, () => p.number).stream
    let events = []
    stream.subscribe(e => events.push(e))
    p.number = 2
    expect(R.map(R.dissoc('id'), events)).toEqual([{ type: 'SET', path: [ 'number' ], val: 2, oldVal: 1 }])
  })
  test('root is not subx', () => { // now root must be subx
    const p = SubX.create({
      number: 1
    })
    const stream = SubX.runAndMonitor(SubX.create({ child: p }), () => p.number).stream
    let events = []
    stream.subscribe(e => events.push(e))
    p.number = 2
    expect(R.map(R.dissoc('id'), events)).toEqual([{ type: 'SET', path: [ 'child', 'number' ], val: 2, oldVal: 1 }])
  })
})
