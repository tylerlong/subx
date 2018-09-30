/* eslint-env jest */
import SubX from '../src/index'

describe('computed events', () => {
  test('default', () => {
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName () {
        return `${this.firstName} ${this.lastName}`
      }
    })
    const events = []
    const computeBegin = []
    const computeFinish = []
    p.$$.subscribe(event => events.push(event))
    p.compute_begin$$.subscribe(event => computeBegin.push(event))
    p.compute_finish$$.subscribe(event => computeFinish.push(event))

    expect(p.fullName).toBe('Tyler Liu')
    expect(p.fullName).toBe('Tyler Liu')
    expect(computeBegin).toEqual([{ type: 'COMPUTE_BEGIN', path: [ 'fullName' ] }])
    expect(computeFinish).toEqual([{ type: 'COMPUTE_FINISH', path: [ 'fullName' ] }])
    expect(events).toEqual([])

    p.firstName = 'Peter'
    expect(computeBegin).toEqual([{ type: 'COMPUTE_BEGIN', path: [ 'fullName' ] }])
    expect(computeFinish).toEqual([{ type: 'COMPUTE_FINISH', path: [ 'fullName' ] }])
    expect(events).toEqual([
      { type: 'SET', path: [ 'firstName' ], val: 'Peter', oldVal: 'Tyler' },
      { type: 'STALE', path: [ 'fullName' ] }
    ])

    expect(p.fullName).toBe('Peter Liu')
    expect(p.fullName).toBe('Peter Liu')
    expect(computeBegin).toEqual([
      { type: 'COMPUTE_BEGIN', path: [ 'fullName' ] },
      { type: 'COMPUTE_BEGIN', path: [ 'fullName' ] }
    ])
    expect(computeFinish).toEqual([
      { type: 'COMPUTE_FINISH', path: [ 'fullName' ] },
      { type: 'COMPUTE_FINISH', path: [ 'fullName' ] }
    ])
    expect(events).toEqual([
      { type: 'SET', path: [ 'firstName' ], val: 'Peter', oldVal: 'Tyler' },
      { type: 'STALE', path: [ 'fullName' ] }
    ])
  })
})
