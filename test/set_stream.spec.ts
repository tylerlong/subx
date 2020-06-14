/* eslint-env jest */
import * as R from 'ramda';

import SubX from '../src/index';
import {HandlerEvent} from '../src/types';

describe('set stream', () => {
  test('set$', () => {
    const p = SubX.create();
    const events: HandlerEvent[] = [];
    p.set$.subscribe(event => {
      events.push(event);
    });
    p.a = 'hello';
    p.b = 'world';
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['a'],
      },
      {
        type: 'SET',
        path: ['b'],
      },
    ]);
  });
  test('set$', () => {
    const p = SubX.create({a: {}, b: {}});
    const events: HandlerEvent[] = [];
    p.set$.subscribe(event => {
      events.push(event);
    });
    p.a.c = 'hello';
    p.b.d = 'world';
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['a', 'c'],
      },
      {
        type: 'SET',
        path: ['b', 'd'],
      },
    ]);
  });
});
