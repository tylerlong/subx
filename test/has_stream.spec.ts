/* eslint-env jest */
import {filter} from 'rxjs/operators';
import * as R from 'ramda';

import SubX from '../src/index';
import {HandlerEvent} from '../src/types';

describe('has stream', () => {
  test('default', () => {
    const p = SubX.create();
    const events: HandlerEvent[] = [];
    p.has$.subscribe(event => {
      events.push(event);
    });
    p.b = 'a' in p;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'HAS',
        path: ['a'],
      },
    ]);
  });

  test('nested', () => {
    const p = SubX.create({a: {b: {c: 'hello'}}});
    const events1: HandlerEvent[] = [];
    p.has$.pipe(filter(event => event.path.length === 1)).subscribe(event => {
      events1.push(event);
    });
    const events2: HandlerEvent[] = [];
    p.has$.subscribe(event => {
      events2.push(event);
    });
    p.b = 'a' in p;
    p.a.b.c = 'd' in p.a.b;
    expect(R.map(R.dissoc('id'), events1)).toEqual([
      {
        type: 'HAS',
        path: ['a'],
      },
    ]);
    expect(R.map(R.dissoc('id'), events2)).toEqual([
      {
        type: 'HAS',
        path: ['a'],
      },
      {
        type: 'HAS',
        path: ['a', 'b', 'd'],
      },
    ]);
  });
});
