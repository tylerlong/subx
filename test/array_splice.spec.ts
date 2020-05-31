/* eslint-env jest */
import * as R from 'ramda';

import SubX from '../src/index';
import {TrapEvent, TransactionEvent} from '../src/types';

describe('array splice', () => {
  test('default', () => {
    const store = SubX.create({
      todos: [1, 2, 3],
    });
    let notified = false;
    store.transaction$.subscribe(() => {
      notified = true;
    });
    store.todos.push(4);
    expect(notified).toBeTruthy();
    notified = false;
    store.todos.splice(1, 1);
    expect(notified).toBeTruthy();
    notified = false;
    expect(store.todos.length).toBe(3);
    store.todos.push(5);
    expect(notified).toBeTruthy();
  });
  test('number of notifications', () => {
    const store = SubX.create({
      todos: [1, 2, 3],
    });
    const events: TransactionEvent[] = [];
    store.transaction$.subscribe(event => events.push(event));
    store.todos.splice(1, 1);
    expect(events.length).toBe(1);
    const transactionEvents = events[0].events;
    expect(R.map(R.dissoc('id'), transactionEvents)).toEqual([
      {type: 'SET', path: ['1']},
      {type: 'DELETE', path: ['2']},
      {type: 'SET', path: ['length']},
    ]);
    expect(events[0].path).toEqual(['todos']);
    expect(events[0].type).toBe('TRANSACTION');
    expect(events[0].name).toBe('splice');
  });
  test('pop', () => {
    const store = SubX.create({
      todos: [1, 2, 3],
    });
    const events: TransactionEvent[] = [];
    store.transaction$.subscribe(event => events.push(event));
    store.todos.pop();
    expect(events.length).toBe(1);
    const transactionEvents = events[0].events;
    expect(R.map(R.dissoc('id'), transactionEvents)).toEqual([
      {type: 'DELETE', path: ['2']},
      {type: 'SET', path: ['length']},
    ]);
    expect(events[0].path).toEqual(['todos']);
    expect(events[0].type).toBe('TRANSACTION');
    expect(events[0].name).toBe('pop');
  });
  test('shift', () => {
    const store = SubX.create({
      todos: [1, 2, 3],
    });
    const events: TransactionEvent[] = [];
    store.transaction$.subscribe(event => events.push(event));
    store.todos.shift(0);
    const lastTransactionEvent = R.last(events[0].events);
    expect(R.dissoc('id', lastTransactionEvent)).toEqual({
      type: 'SET',
      path: ['length'],
    });
    expect(events[0].path).toEqual(['todos']);
    expect(events[0].type).toBe('TRANSACTION');
    expect(events[0].name).toBe('shift');
  });
  test('map and get events', () => {
    const store = SubX.create({
      todos: [1, 2, 3],
    });
    const events: TrapEvent[] = [];
    store.get$.subscribe(event => events.push(event));
    expect(store.todos.map((todo: number[]) => todo)).toBeDefined();
    expect(
      events.some(event =>
        R.equals(R.dissoc('id', event), {
          type: 'GET',
          path: ['todos', 'length'],
        })
      )
    ).toBeTruthy();
  });
});
