/* eslint-env jest */
import * as R from 'ramda';

import SubX from '../src/index';
import {TrapEvent, StaleEvent} from '../src/types';

describe('computed events', () => {
  test('default', () => {
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    });
    const events: TrapEvent[] = [];
    const stale: StaleEvent[] = [];
    const computeBegin: TrapEvent[] = [];
    const computeFinish: TrapEvent[] = [];
    p.$.subscribe(event => events.push(event));
    p.stale$.subscribe(event => stale.push(event));
    p.compute_begin$.subscribe(event => computeBegin.push(event));
    p.compute_finish$.subscribe(event => computeFinish.push(event));

    expect(p.fullName).toBe('Tyler Liu');
    expect(p.fullName).toBe('Tyler Liu');
    expect(R.map(R.dissoc('id'), computeBegin)).toEqual([
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), computeFinish)).toEqual([
      {type: 'COMPUTE_FINISH', path: ['fullName']},
    ]);
    expect(events).toEqual([]);
    expect(stale).toEqual([]);

    p.firstName = 'Peter';
    expect(R.map(R.dissoc('id'), computeBegin)).toEqual([
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), computeFinish)).toEqual([
      {type: 'COMPUTE_FINISH', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {type: 'SET', path: ['firstName']},
    ]);
    expect(
      R.map(R.pipe(R.dissoc('root'), R.dissoc('cache'), R.dissoc('id')), stale)
    ).toEqual([{type: 'STALE', path: ['fullName']}]);

    expect(p.fullName).toBe('Peter Liu');
    expect(p.fullName).toBe('Peter Liu');
    expect(R.map(R.dissoc('id'), computeBegin)).toEqual([
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), computeFinish)).toEqual([
      {type: 'COMPUTE_FINISH', path: ['fullName']},
      {type: 'COMPUTE_FINISH', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {type: 'SET', path: ['firstName']},
    ]);
    expect(
      R.map(R.pipe(R.dissoc('root'), R.dissoc('cache'), R.dissoc('id')), stale)
    ).toEqual([{type: 'STALE', path: ['fullName']}]);
  });

  test('Nested computed', () => {
    const p = SubX.create({
      firstName: 'Tyler',
      lastName: 'Liu',
      get fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      get longFullName() {
        return `${this.fullName}`;
      },
    });
    const events: TrapEvent[] = [];
    const stale: StaleEvent[] = [];
    const computeBegin: TrapEvent[] = [];
    const computeFinish: TrapEvent[] = [];
    p.$.subscribe(event => events.push(event));
    p.stale$.subscribe(event => stale.push(event));
    p.compute_begin$.subscribe(event => computeBegin.push(event));
    p.compute_finish$.subscribe(event => computeFinish.push(event));

    expect(p.longFullName).toBe('Tyler Liu');
    expect(p.longFullName).toBe('Tyler Liu');
    expect(R.map(R.dissoc('id'), computeBegin)).toEqual([
      {type: 'COMPUTE_BEGIN', path: ['longFullName']},
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), computeFinish)).toEqual([
      {type: 'COMPUTE_FINISH', path: ['fullName']},
      {type: 'COMPUTE_FINISH', path: ['longFullName']},
    ]);
    expect(events).toEqual([]);
    expect(stale).toEqual([]);

    p.firstName = 'Peter';
    expect(R.map(R.dissoc('id'), computeBegin)).toEqual([
      {type: 'COMPUTE_BEGIN', path: ['longFullName']},
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), computeFinish)).toEqual([
      {type: 'COMPUTE_FINISH', path: ['fullName']},
      {type: 'COMPUTE_FINISH', path: ['longFullName']},
    ]);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {type: 'SET', path: ['firstName']},
    ]);
    expect(
      R.map(R.pipe(R.dissoc('root'), R.dissoc('cache'), R.dissoc('id')), stale)
    ).toEqual([
      {type: 'STALE', path: ['fullName']},
      {type: 'STALE', path: ['longFullName']},
    ]);

    expect(p.longFullName).toBe('Peter Liu');
    expect(p.longFullName).toBe('Peter Liu');
    expect(R.map(R.dissoc('id'), computeBegin)).toEqual([
      {type: 'COMPUTE_BEGIN', path: ['longFullName']},
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
      {type: 'COMPUTE_BEGIN', path: ['longFullName']},
      {type: 'COMPUTE_BEGIN', path: ['fullName']},
    ]);
    expect(R.map(R.dissoc('id'), computeFinish)).toEqual([
      {type: 'COMPUTE_FINISH', path: ['fullName']},
      {type: 'COMPUTE_FINISH', path: ['longFullName']},
      {type: 'COMPUTE_FINISH', path: ['fullName']},
      {type: 'COMPUTE_FINISH', path: ['longFullName']},
    ]);
    expect(R.map(R.dissoc('id'), events)).toEqual([
      {type: 'SET', path: ['firstName']},
    ]);
    expect(
      R.map(R.pipe(R.dissoc('root'), R.dissoc('cache'), R.dissoc('id')), stale)
    ).toEqual([
      {type: 'STALE', path: ['fullName']},
      {type: 'STALE', path: ['longFullName']},
    ]);
  });
});
