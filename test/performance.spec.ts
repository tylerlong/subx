/* eslint-env jest */
import {from} from 'rxjs';
import {take, map, debounceTime} from 'rxjs/operators';
import waitFor from 'wait-for-async';

describe('performance', () => {
  test('take', () => {
    let count1 = 0;
    let count2 = 0;
    from([1, 2, 3])
      .pipe(
        map(i => {
          count1 += 1;
          return i * 2;
        }),
        take(1)
      )
      .subscribe(() => {
        count2 += 1;
      });
    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });
  test('debounceTime', async () => {
    let count1 = 0;
    let count2 = 0;
    from([1, 2, 3])
      .pipe(
        map(i => {
          count1 += 1;
          return i * 2;
        }),
        debounceTime(1)
      )
      .subscribe(() => {
        count2 += 1;
      });
    await waitFor({interval: 5});
    expect(count1).toBe(3); // why? debounceTime is async, cannot save map's execution.
    expect(count2).toBe(1);
  });
});
