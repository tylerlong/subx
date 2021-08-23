/* eslint-env jest */
import * as R from 'ramda';
import _ from 'lodash';

import SubX from '../src/index';
import {HandlerEvent, TransactionEvent} from '../src/types';

describe('runAndMonitor path', () => {
  test('root is subx', () => {
    const p = SubX.create({
      number: 1,
    });
    const stream$ = SubX.runAndMonitor(p, () => p.number).stream$;
    const events: HandlerEvent[] = [];
    stream$.subscribe(e => events.push(e));
    p.number = 2;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {type: 'SET', path: ['number']},
    ]);
  });

  test('root is not subx', () => {
    // now root must be subx
    const p = SubX.create({
      number: 1,
    });
    const stream$ = SubX.runAndMonitor(
      SubX.create({child: p}),
      () => p.number
    ).stream$;
    const events: HandlerEvent[] = [];
    stream$.subscribe(e => events.push(e));
    p.number = 2;
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {type: 'SET', path: ['child', 'number']},
    ]);
  });

  test('TodoMVC save', () => {
    const store = SubX.create({
      todos: [
        {
          title: '111',
          completed: false,
        },
      ],
      visibility: 'all',
    });
    const stream$ = SubX.runAndMonitor(store, () =>
      JSON.stringify(store.todos)
    ).stream$;
    const events: HandlerEvent[] = [];
    stream$.subscribe(e => events.push(e));
    store.todos.push({title: '222', completed: false});
    expect(events.length).toBe(1);
    let event = events[0] as TransactionEvent;
    event = _.omit(event, 'id') as TransactionEvent;
    event.events = _.map(event.events, e => _.omit(e, 'id') as HandlerEvent);
    expect(event).toEqual({
      events: [
        {path: ['1'], type: 'SET'},
        {path: ['length'], type: 'SET'},
      ],
      name: 'push',
      path: ['todos'],
      type: 'TRANSACTION',
    });
  });

  test('toJSON events', () => {
    const store = SubX.create({
      todos: [
        {
          title: '111',
          completed: false,
        },
      ],
      visibility: 'all',
    });
    const gets = [];
    const hass = [];
    const keyss = [];
    store.get$.subscribe(e => gets.push(e));
    store.has$.subscribe(e => hass.push(e));
    store.keys$.subscribe(e => keyss.push(e));
    expect(JSON.stringify(store.todos)).toBeDefined();
    expect(gets.length).toBeGreaterThan(0);
    expect(hass.length).toBe(0);
    expect(keyss.length).toBeGreaterThan(0);
  });
});
