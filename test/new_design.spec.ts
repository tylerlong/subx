/* eslint-env jest */
import {combineLatest} from 'rxjs';
import {filter, map, startWith} from 'rxjs/operators';
import _ from 'lodash';

import SubX from '../src/index';
import {HandlerEvent} from '../src/types';

describe('new design', () => {
  test('JSON.stringify', () => {
    const p = SubX.create({hello: 'world'});
    p.firstName = 'Si';
    p.lastName = 'Li';
    p.firstName = 'Wu';
    p.lastName = 'Wang';

    expect(JSON.stringify(p, null, 2)).toBe(`{
  "hello": "world",
  "firstName": "Wu",
  "lastName": "Wang"
}`);
  });

  test('nested', () => {
    const n = SubX.create({a: {}});

    let count1 = 0;
    n.$.subscribe(() => {
      count1 += 1;
    });

    let count2 = 0;
    n.a.$.subscribe(() => {
      count2 += 1;
    });

    n.a.b = 'hello';
    expect(count1).toBe(1);
    expect(count2).toBe(1);
  });

  test('$', () => {
    const n = SubX.create({a: {}});
    const events1: HandlerEvent[] = [];
    n.$.subscribe(event => {
      events1.push(event);
    });
    n.a.b = {};
    n.a.b.c = {};
    const events2: HandlerEvent[] = [];
    n.a.b.c.$.subscribe((event: HandlerEvent) => {
      events2.push(event);
    });
    n.a.b.c.d = {};
    n.a.b.c.d.e = {};

    expect(_.map(events1, e => _.omit(e, 'id'))).toEqual([
      {
        type: 'SET',
        path: ['a', 'b'],
      },
      {
        type: 'SET',
        path: ['a', 'b', 'c'],
      },
      {
        type: 'SET',
        path: ['a', 'b', 'c', 'd'],
      },
      {
        type: 'SET',
        path: ['a', 'b', 'c', 'd', 'e'],
      },
    ]);

    expect(_.map(events2, e => _.omit(e, 'id'))).toEqual([
      {
        type: 'SET',
        path: ['d'],
      },
      {
        type: 'SET',
        path: ['d', 'e'],
      },
    ]);
  });

  test('rxjs operators', () => {
    const p = SubX.create({firstName: '', lastName: ''});
    p.firstName = 'Chuntao';
    p.lastName = 'Liu';
    const firstName$ = p.$.pipe(
      filter(event => event.path[0] === 'firstName'),
      map(event => _.get(p, event.path)),
      startWith(p.firstName)
    );
    const lastName$ = p.$.pipe(
      filter(event => event.path[0] === 'lastName'),
      map(event => _.get(p, event.path)),
      startWith(p.lastName)
    );
    const data: string[][] = [];
    combineLatest(firstName$, lastName$).subscribe(([firstName, lastName]) => {
      data.push([firstName, lastName]);
    });
    p.firstName = 'Tyler';
    p.lastName = 'Lau';

    expect(data).toEqual([
      ['Chuntao', 'Liu'],
      ['Tyler', 'Liu'],
      ['Tyler', 'Lau'],
    ]);
  });

  test('class', () => {
    const Person = SubX.model({
      firstName: 'San',
      lastName: 'Zhang',
      fullName: function () {
        return `${this.firstName} ${this.lastName}`;
      },
    });
    const p = Person.create({firstName: 'Chuntao'});
    expect(p.fullName()).toBe('Chuntao Zhang');
  });

  test('instanceof', () => {
    const Person = SubX.model({name: 'Tyler Liu'});
    const p = Person.create();
    expect(p.name).toBe('Tyler Liu');
  });

  test('delete event', () => {
    const Person = SubX.model({firstName: '', lastName: ''});
    const p = Person.create({firstName: 'Chuntao', lastName: 'Liu'});
    const events: HandlerEvent[] = [];
    p.delete$.subscribe(event => {
      events.push(event);
    });
    delete p.firstName;
    delete p.lastName;
    expect(events.length).toBe(2);
    expect(_.map(events, e => _.omit(e, 'id'))).toEqual([
      {
        type: 'DELETE',
        path: ['firstName'],
      },
      {
        type: 'DELETE',
        path: ['lastName'],
      },
    ]);
  });
});
