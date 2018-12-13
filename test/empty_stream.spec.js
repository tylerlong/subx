/* eslint-env jest */
import { empty, merge } from 'rxjs'
import { first, publish, distinct, take } from 'rxjs/operators'

describe('empty stream', () => {
  test('default', () => {
    empty().pipe(first()).subscribe(e => console.log(e))
  })

  test('merge', () => {
    merge().pipe(first()).subscribe(e => console.log(e))
  })

  test('real', () => {
    merge(...[], ...[], ...[]).pipe(distinct(), publish()).refCount().pipe(first()).subscribe(e => console.log(e))
  })

  test('take(1)', () => {
    merge(...[], ...[], ...[]).pipe(distinct(), publish()).refCount().pipe(take(1)).subscribe(e => console.log(e))
  })
})
