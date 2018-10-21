/* eslint-env jest */
import SubX from '../src/index'

describe('transaction', () => {
  test('default', () => {
    const p = SubX.create({
      a: 1
    })
    const events = []
    p.$.subscribe(e => events.push(e))
    p.a = 2
    p.a = 3
    p.a = 4
    expect(events.length).toBe(3)
  })

  test('transaction', () => {
    const p = SubX.create({
      a: {
        b: 1
      }
    })
    const events = []
    p.$.subscribe(e => events.push(e))
    const events2 = []
    p.transaction$.subscribe(e => events2.push(e))
    p.a.startTransaction()
    p.a.b = 2
    p.a.b = 3
    p.a.b = 4
    expect(events.length).toBe(0)
    expect(events2.length).toBe(0)
    p.a.endTransaction()
    expect(events.length).toBe(0)
    expect(events2.length).toBe(1)
    // console.log(JSON.stringify(events2, null, 2))
  })
})
