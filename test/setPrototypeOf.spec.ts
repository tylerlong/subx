/* eslint-env jest */
import SubX from '../src/index';
import {JsonObj} from '../src/types';

describe('setPrototypeOf', () => {
  test('default', () => {
    const a = {};
    const p = new Proxy(a, {}) as {b: number};
    Object.setPrototypeOf(p, {b: 1});
    expect(p.b).toBe(1);
  });
  test('disallow', () => {
    const a = {};
    const handler = {
      setPrototypeOf: () => {
        return false;
      },
    };
    const p = new Proxy(a, handler);
    const f = () => Object.setPrototypeOf(p, {b: 1});
    expect(f).toThrow(TypeError);
  });
  test('Reflect', () => {
    const a = {};
    const handler = {
      setPrototypeOf: () => {
        return false;
      },
    };
    const p = new Proxy(a, handler);
    Reflect.setPrototypeOf(p, {b: 1});
    expect((p as any).b).toBeUndefined();
  });
  test('SubX', () => {
    const p = SubX.create({});
    expect(p.b).toBeUndefined();
    Reflect.setPrototypeOf(p, {b: 1});
    expect(p.b).toBeUndefined();
    const f = () => Object.setPrototypeOf(p, {b: 1});
    expect(f).toThrow(TypeError);
  });
  test('too flexible', () => {
    let count = 0;
    const o = {};
    const handler = {
      set: (target: JsonObj, prop: string, val: any) => {
        target[prop] = val;
        count += 1;
        return true;
      },
    };
    const p = new Proxy(o, handler);
    p.a = 1; // trigger handler.set
    expect(count).toBe(1);
    const b = {c: 0};
    Object.setPrototypeOf(p, b);
    b.c = 2; // doesn't trigget handler.set
    expect(count).toBe(1); // still 1
    expect(p.c).toBe(2);
  });
});
