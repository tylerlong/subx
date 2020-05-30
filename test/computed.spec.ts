/* eslint-env jest */
import * as R from 'ramda';
import {ModelObj} from '../src/types';

const computed = (o: ModelObj, f: (a: number) => number) => {
  const cache: {[key: string]: any} = {};
  const dependencies: {[key: string]: any} = {};
  const temp = function (b: number) {
    if (
      !(b in cache) ||
      R.pipe(
        R.keys,
        R.any(key => dependencies[key] !== o[key])
      )(dependencies)
    ) {
      const proxy = new Proxy(o, {
        get: (target: ModelObj, prop: string, receiver) => {
          dependencies[prop] = target[prop];
          return target[prop];
        },
      });
      cache[b] = f.bind(proxy)(b);
    }
    return cache[b];
  };
  return temp;
};

describe('mobx', () => {
  test('default', () => {
    let count = 0;
    const o = {
      a: 1,
      b: 2,
      c(d = 0) {
        count += 1;
        return this.a + this.b + d;
      },
    };
    o.c = computed(o, o.c);
    const r1 = o.c();
    const r2 = o.c();
    expect(r1).toBe(3);
    expect(r2).toBe(3);
    expect(count).toBe(1);

    const r3 = o.c(1);
    const r4 = o.c(1);
    expect(r3).toBe(4);
    expect(r4).toBe(4);
    expect(count).toBe(2);

    o.a = 2;
    const r5 = o.c(1);
    const r6 = o.c(1);
    expect(r5).toBe(5);
    expect(r6).toBe(5);
    expect(count).toBe(3);
  });
});
