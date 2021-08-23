/* eslint-env jest */
import _ from 'lodash';

import SubX from '../src/index';
import {HandlerEvent} from '../src/types';

describe('null value', () => {
  test('should allow null assign', () => {
    const person = SubX.create({});

    const events: HandlerEvent[] = [];
    person.$.subscribe(event => {
      events.push(event);
    });

    person.name = 'hello';
    person.name = null;

    expect(_.map(events, e => _.omit(e, 'id'))).toEqual([
      {
        type: 'SET',
        path: ['name'],
      },
      {
        type: 'SET',
        path: ['name'],
      },
    ]);
  });
});
