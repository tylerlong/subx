import {ModelObj} from '../src/types';

/* eslint-env jest */
describe('ES6 collections', () => {
  test('Map', () => {
    const m = new Map();
    m.set('a', 1);
    (m as any).b = 2;
    expect(m.get('a')).toBe(1);
    expect(m.get('b')).toBeUndefined();
    expect((m as any).b).toBe(2);
    expect((m as any).a).toBeUndefined();
    expect(Object.keys(m)).toEqual(['b']);
    expect(JSON.stringify(m)).toBe('{"b":2}');
  });

  test('Map & proxy', () => {
    const m = new Map();
    m.set('c', 3);
    const gets: string[] = [];
    const sets: string[] = [];
    const handler = {
      get: (target: ModelObj, prop: string, receiver: ModelObj) => {
        gets.push(prop);
        return target[prop];
      },
      set: (target: ModelObj, prop: string, val: any, receiver: ModelObj) => {
        sets.push(prop);
        target[prop] = val;
        return true;
      },
    };
    const p = new Proxy(m, handler);
    p.a = 1;
    expect(p.a).toBe(1);
    p.set.bind(m)('b', 2);
    expect(p.get.bind(m)('b')).toBe(2);
    expect(gets).toEqual(['a', 'set', 'get']);
    expect(sets).toEqual(['a']);
  });
});
