/* eslint-env jest */
import _ from 'lodash';
import * as R from 'ramda';

import SubX from '../src/index';
import {TransactionEvent, HandlerEvent} from '../src/types';

describe('array', () => {
  test('foreach', () => {
    const a = SubX.create([1, 2, 3]);
    a.push(4);
    let count = 0;
    a.forEach(() => {
      count += 1;
    });
    expect(count).toBe(4);
  });
  test('foreach 2', () => {
    const a = SubX.create([1, 2, 3, 4]);
    a[1] = 2;
    a[2] = 3;
    let count = 0;
    a.forEach(() => {
      count += 1;
    });
    expect(count).toBe(4);
  });
  test('keys', () => {
    const a = SubX.create([1, 2, 3]);
    expect(R.keys(a)).toEqual(R.keys([1, 2, 3]));
  });
  test('toPairs', () => {
    const a = SubX.create([1, 2, 3]);
    expect(R.toPairs(a)).toEqual([
      ['0', 1],
      ['1', 2],
      ['2', 3],
    ]);
  });
  test('compare', () => {
    const a = SubX.create([1, 2, 3]);
    expect(a).toEqual([1, 2, 3]);
    expect(R.equals(a, [1, 2, 3] as unknown)).toBeTruthy();
  });
  test('push', () => {
    const a = SubX.create([1, 2, 3]);
    const events = [];
    a.$.subscribe(event => {
      events.push(event);
    });
    const events22: TransactionEvent[] = [];
    a.transaction$.subscribe(e => events22.push(e));
    a.push(4);
    expect(a).toEqual([1, 2, 3, 4]);
    expect(events22.length).toBe(1);
    expect(R.pipe(R.dissoc('events'), R.dissoc('id'))(events22[0])).toEqual({
      type: 'TRANSACTION',
      name: 'push',
      path: [],
    });
    expect(R.map(R.dissoc('id'), events22[0].events)).toEqual([
      {path: ['3'], type: 'SET'},
      {path: ['length'], type: 'SET'},
    ]);
  });
  test('assign', () => {
    const a = SubX.create([1, 2, 3]);
    const events: HandlerEvent[] = [];
    a.$.subscribe(event => {
      events.push(event);
    });
    a[1] = 4;
    expect(a).toEqual([1, 4, 3]);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['1'],
      },
    ]);
  });
  test('unshift', () => {
    const a = SubX.create([1, 2, 3]);
    const events: HandlerEvent[] = [];
    a.$.subscribe(event => events.push(event));
    const events2: TransactionEvent[] = [];
    a.transaction$.subscribe(e => events2.push(e));
    a.unshift(0);
    expect(a).toEqual([0, 1, 2, 3]);
    expect(R.map(R.dissoc('id'), events)).toEqual([]);
    expect(events2.length).toBe(1);
    expect(R.map(R.dissoc('id'), events2[0].events)).toEqual([
      {
        type: 'SET',
        path: ['3'],
      },
      {
        type: 'SET',
        path: ['2'],
      },
      {
        type: 'SET',
        path: ['1'],
      },
      {
        type: 'SET',
        path: ['0'],
      },
      {
        type: 'SET',
        path: ['length'],
      },
    ]);
  });
  test('nested', () => {
    const o = SubX.create({b: {a: [1, 2, 3]}});

    // foreach
    let count = 0;
    R.forEach(() => {
      count += 1;
    }, o.b.a);
    expect(count).toBe(3);

    // keys
    expect(R.keys(o.b.a)).toEqual(R.keys([1, 2, 3]));

    // toPairs
    expect(R.toPairs(o.b.a)).toEqual([
      ['0', 1],
      ['1', 2],
      ['2', 3],
    ]);

    // compare
    expect(o.b.a).toEqual([1, 2, 3]);
    expect(R.equals(o.b.a, [1, 2, 3])).toBeTruthy();

    let events: HandlerEvent[] = [];
    o.$.subscribe(event => events.push(event));

    // push
    const events22: TransactionEvent[] = [];
    o.transaction$.subscribe(e => events22.push(e));
    o.b.a.push(4);
    expect(o.b.a).toEqual([1, 2, 3, 4]);
    expect(R.map(R.dissoc('id'), events)).toEqual([]); // no event out of transaction
    expect(events22.length).toBe(1);
    expect(R.pipe(R.dissoc('events'), R.dissoc('id'))(events22[0])).toEqual({
      type: 'TRANSACTION',
      name: 'push',
      path: ['b', 'a'],
    });
    expect(R.map(R.dissoc('id'), events22[0].events)).toEqual([
      {path: ['3'], type: 'SET'},
      {path: ['length'], type: 'SET'},
    ]);

    // assign
    o.b.a = [1, 2, 3];
    events = [];
    o.b.a[1] = 4;
    expect(o.b.a).toEqual([1, 4, 3]);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {
        type: 'SET',
        path: ['b', 'a', '1'],
      },
    ]);

    // unshift
    o.b.a = [1, 2, 3];
    events = [];
    const events2: TransactionEvent[] = [];
    o.transaction$.subscribe(event => events2.push(event));
    o.b.a.unshift(0);
    expect(o.b.a).toEqual([0, 1, 2, 3]);
    expect(R.map(R.dissoc('id'), events)).toEqual([]);
    expect(events2.length).toBe(1);
    events2[0].events = _.map(
      events2[0].events,
      e => _.omit(e, 'id') as HandlerEvent
    );
    expect(R.dissoc('id', events2[0])).toEqual({
      type: 'TRANSACTION',
      name: 'unshift',
      path: ['b', 'a'],
      events: [
        {
          type: 'SET',
          path: ['3'],
        },
        {
          type: 'SET',
          path: ['2'],
        },
        {
          type: 'SET',
          path: ['1'],
        },
        {
          type: 'SET',
          path: ['0'],
        },
        {
          type: 'SET',
          path: ['length'],
        },
      ],
    });
  });
});
