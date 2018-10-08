/* eslint-env jest */
import { Subject, merge } from 'rxjs'

describe('RxJS event order', () => {
  test('default', () => {
    const s1 = new Subject()
    const s2 = new Subject()
    s1.subscribe(v => {
      s2.next('STALE')
    })
    const s3 = merge(s1, s2)
    const events = []
    s3.subscribe(event => events.push(event))
    s1.next(1)
    s1.next(2)
    expect(events).toEqual(['STALE', 1, 'STALE', 2]) // not [1, 'STALE', 2, 'STALE']
  })
})
