/* eslint-env jest */
import {filter} from 'rxjs/operators';

import SubX from '../src/index';
import {TrapEvent} from '../src/types';

describe('unsubscribe', () => {
  test('delete property', () => {
    const p = SubX.create({firstName: 'San', test: {}});
    delete p.firstName;
    expect(p.firstName).toBeUndefined();
    let count1 = 0;
    p.$.pipe(filter(event => event.type === 'SET')).subscribe(event => {
      count1 += 1;
    });
    const test = p.test;
    delete p.test;
    let count2 = 0;
    test.$.subscribe((event: TrapEvent) => {
      count2 += 1;
    });
    test.a = {};
    test.a.b = {};
    expect(count1).toBe(0);
    expect(count2).toBe(2);
  });

  test('override property', () => {
    const p = SubX.create({a: {b: {}}});
    let count = 0;
    p.$.subscribe(event => {
      count += 1;
    });
    const b = p.a.b;
    b.c = {};
    b.d = {};
    p.a.b = {};
    expect(count).toBe(3);
    let count2 = 0;
    b.$.subscribe((event: TrapEvent) => {
      count2 += 1;
    });
    b.c = {};
    b.d = {};
    expect(count).toBe(3); // still 3, because b is not longer children of p
    expect(count2).toBe(2);
    p.a.b.c = {};
    expect(count).toBe(4);
  });
});
