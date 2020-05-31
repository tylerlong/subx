/* eslint-env jest */
import {Subject, merge} from 'rxjs';

describe('RxJS event order', () => {
  test('default', () => {
    const s1 = new Subject();
    const s2 = new Subject();
    s1.subscribe(() => {
      s2.next('STALE');
    });
    const s3 = merge(s1, s2);
    const events: (number | string)[] = [];
    s3.subscribe((event: any) => events.push(event));
    s1.next(1);
    s1.next(2);
    expect(events).toEqual(['STALE', 1, 'STALE', 2]); // not [1, 'STALE', 2, 'STALE']
  });

  // Conclusion is: whichever subscribe first gets the notification first
  test('default 2', () => {
    const s1 = new Subject();
    const s2 = new Subject();
    const s3 = merge(s1, s2);
    const events: (number | string)[] = [];
    s3.subscribe((event: any) => events.push(event));
    s1.subscribe(() => {
      s2.next('STALE');
    });
    s1.next(1);
    s1.next(2);
    expect(events).toEqual([1, 'STALE', 2, 'STALE']); // not ['STALE', 1, 'STALE', 2]
  });
});
