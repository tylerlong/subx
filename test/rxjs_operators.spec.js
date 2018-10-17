/* eslint-env jest */
import { Subject } from 'rxjs'
import { finalize } from 'rxjs/operators'

describe('RxJS operators', () => {
  test('finalize', () => {
    const p = new Subject()
    let count = 0
    const temp = p.pipe(finalize(() => { count += 1 }))
    // temp.subscribe(console.log)
    temp.complete()
    expect(count).toBe(0) // finalize doesn't trigger without subscribers
  })

  test('finalize 2', () => {
    const p = new Subject()
    let count = 0
    const temp = p.pipe(finalize(() => { count += 1 }))
    temp.subscribe(e => {})
    temp.complete()
    expect(count).toBe(1) // finalize does trigger with subscribers
  })

  test('complete', () => {
    const p = new Subject()
    let count = 0
    p.subscribe(undefined, undefined, () => { count += 1 })
    p.complete()
    expect(count).toBe(1)
  })
})
