/* eslint-env jest */
import SubX from '../src/index'
import './benchmark'

describe('get stream', () => {
  test('default', () => {
    const p = SubX.create()
    const events = []
    p.get$.subscribe(event => {
      events.push(event)
    })
    p.b = p.a
    expect(events).toEqual([
      {
        type: 'GET',
        path: ['a'],
        val: undefined
      }
    ])
  })

  test('nested', () => {
    // const p = SubX.create({ a: { b: { c: 'hello' } } })
    // const events1 = []
    // p.get$.subscribe(event => {
    //   events1.push(event)
    // })
    // p.a.b.d = p.a.b.c
    // expect(events1).toEqual([])
  })
})
