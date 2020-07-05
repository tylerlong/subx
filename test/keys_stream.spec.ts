/* eslint-env jest */
import R from 'ramda';

import SubX from '../src/index';
import {HandlerEvent} from '../src/types';

describe('keys stream', () => {
  test('keys$', () => {
    const p = SubX.create();
    const events: HandlerEvent[] = [];
    p.keys$.subscribe(event => {
      events.push(event);
    });
    p.a = Object.keys(p);
    p.c = Object.keys(p);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'KEYS',
        path: [],
      },
      {
        type: 'KEYS',
        path: [],
      },
    ]);
  });
  test('keys$', () => {
    const p = SubX.create({a: {}, b: {}});
    const events: HandlerEvent[] = [];
    p.keys$.subscribe(event => {
      events.push(event);
    });
    p.a.c = Object.keys(p.a);
    p.b.d = Object.keys(p.a);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'KEYS',
        path: ['a'],
      },
      {
        type: 'KEYS',
        path: ['a'],
      },
    ]);
  });
});
