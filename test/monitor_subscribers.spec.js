/* eslint-env jest */
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'

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
})
