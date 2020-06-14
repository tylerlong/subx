/* eslint-env jest */
import * as R from 'ramda';

import SubX from '../src/index';
import {HandlerEvent} from '../src/types';

describe('sub streams', () => {
  test('set$', () => {
    const p = SubX.create();
    const events: HandlerEvent[] = [];
    p.set$.subscribe(event => {
      events.push(event);
    });
    p.a = 1;
    p.b = 2;
    p.a = 3;
    delete p.b;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['a'],
      },
      {
        type: 'SET',
        path: ['b'],
      },
      {
        type: 'SET',
        path: ['a'],
      },
    ]);
  });

  test('delete$', () => {
    const p = SubX.create();
    const events: HandlerEvent[] = [];
    p.delete$.subscribe(event => {
      events.push(event);
    });
    p.a = 1;
    p.b = 2;
    p.a = 3;
    delete p.b;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'DELETE',
        path: ['b'],
      },
    ]);
  });

  test('$', () => {
    const p = SubX.create();
    const events1: HandlerEvent[] = [];
    const events2: HandlerEvent[] = [];
    const events3: HandlerEvent[] = [];
    p.set$.subscribe(event => {
      events1.push(event);
    });
    p.delete$.subscribe(event => {
      events2.push(event);
    });
    p.$.subscribe(event => {
      events3.push(event);
    });
    p.a = 1;
    p.b = 2;
    p.a = 3;
    delete p.b;
    expect(events3).toEqual(events1);
  });
});
