/* eslint-env jest */
import {empty, merge} from 'rxjs';
import {publish, distinct, take, refCount} from 'rxjs/operators';

describe('empty stream', () => {
  test('default', () => {
    empty()
      .pipe(take(1))
      .subscribe(e => console.log(e));
  });

  test('merge', () => {
    merge()
      .pipe(take(1))
      .subscribe(e => console.log(e));
  });

  test('real', () => {
    merge(...[], ...[], ...[])
      .pipe(distinct(), publish(), refCount())
      .pipe(take(1))
      .subscribe(e => console.log(e));
  });

  /*
  Cannot use first() here, it will throw error for empty stream, by design
  */
});
