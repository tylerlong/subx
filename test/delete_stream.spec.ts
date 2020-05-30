/* eslint-env jest */
import * as R from 'ramda';

import SubX from '../src/index';
import {TrapEvent} from '../src/types';

describe('delete stream', () => {
  test('delete$', () => {
    const p = SubX.create({a: {}, b: {}});
    const events: TrapEvent[] = [];
    p.delete$.subscribe(event => {
      events.push(event);
    });
    delete p.a;
    delete p.b;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'DELETE',
        path: ['a'],
      },
      {
        type: 'DELETE',
        path: ['b'],
      },
    ]);
  });
  test('delete$', () => {
    const p = SubX.create({a: {}, b: {}});
    const events: TrapEvent[] = [];
    p.delete$.subscribe(event => {
      events.push(event);
    });
    delete p.a.c;
    delete p.b.d;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'DELETE',
        path: ['a', 'c'],
      },
      {
        type: 'DELETE',
        path: ['b', 'd'],
      },
    ]);
  });
});
