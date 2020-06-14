/* eslint-env jest */
import SubX from '../src/index';
import {JsonObj} from '../src/types';

describe('preventExtensions', () => {
  test('default', () => {
    const p = {};
    Object.preventExtensions(p);
    const f = () => {
      (p as any).a = 1;
    };
    expect(f).toThrow(TypeError);
  });
  test('disallow preventExtensions', () => {
    const a = {};
    const handler = {
      preventExtensions: () => {
        return false;
      },
    };
    const p = new Proxy(a, handler) as {a: number};
    const f = () => Object.preventExtensions(p);
    expect(f).toThrow(TypeError);
    Reflect.preventExtensions(p);
    p.a = 1;
    expect(p.a).toBe(1);
  });
  test('SubX', () => {
    const p = SubX.create({});
    const f = () => Object.preventExtensions(p);
    expect(f).toThrow(TypeError);
    Reflect.preventExtensions(p);
    p.a = 1;
    expect(p.a).toBe(1);
  });
  // test('SubX', () => { // We do nothing to preventExtensions. Because JS proxy doesn't support Object.freeze/seal
  //   const p = SubX.create({})
  //   Object.preventExtensions(p) // or Reflect.preventExtensions(p)
  //   expect(() => { p.a = 1 }).toThrow(TypeError)
  //   expect(p.a).toBeUndefined()
  // })
  test('preventExtensions detailed count', () => {
    const a = {b: ''};
    const counts = {
      preventExtensions: 0,
      isExtensible: 0,
      defineProperty: 0,
      getOwnPropertyDescriptor: 0,
    };
    const handler = {
      preventExtensions: (target: JsonObj) => {
        counts.preventExtensions += 1;
        Object.preventExtensions(target);
        return true;
      },
      isExtensible: (target: JsonObj) => {
        counts.isExtensible += 1;
        const result = Object.isExtensible(target);
        return result;
      },
      defineProperty: (
        target: JsonObj,
        property: string,
        descriptor: PropertyDescriptor
      ) => {
        counts.defineProperty += 1;
        Reflect.defineProperty(target, property, descriptor);
        return true;
      },
      getOwnPropertyDescriptor: (target: JsonObj, prop: string) => {
        counts.getOwnPropertyDescriptor += 1;
        const result = Object.getOwnPropertyDescriptor(target, prop);
        return result;
      },
    };
    const p = new Proxy(a, handler);
    expect(counts.preventExtensions).toBe(0);
    expect(counts.isExtensible).toBe(0);
    Object.preventExtensions(p);
    expect(counts.preventExtensions).toBe(1);
    expect(counts.isExtensible).toBe(0);
    expect(Object.isExtensible(p)).toBeFalsy();
    expect(counts.preventExtensions).toBe(1);
    expect(counts.isExtensible).toBe(1);
    expect(counts.defineProperty).toBe(0);
    expect(counts.getOwnPropertyDescriptor).toBe(0);
  });

  test('freeze detailed count', () => {
    const a = {b: ''};
    const counts = {
      preventExtensions: 0,
      isExtensible: 0,
      defineProperty: 0,
      getOwnPropertyDescriptor: 0,
    };
    const handler = {
      preventExtensions: (target: JsonObj) => {
        counts.preventExtensions += 1;
        Object.preventExtensions(target);
        return true;
      },
      isExtensible: (target: JsonObj) => {
        counts.isExtensible += 1;
        const result = Object.isExtensible(target);
        return result;
      },
      defineProperty: (
        target: JsonObj,
        property: string,
        descriptor: PropertyDescriptor
      ) => {
        counts.defineProperty += 1;
        Reflect.defineProperty(target, property, descriptor);
        return true;
      },
      getOwnPropertyDescriptor: (target: JsonObj, prop: string) => {
        counts.getOwnPropertyDescriptor += 1;
        const result = Object.getOwnPropertyDescriptor(target, prop);
        return result;
      },
    };
    const p = new Proxy(a, handler);
    expect(counts.preventExtensions).toBe(0);
    expect(counts.isExtensible).toBe(0);
    expect(counts.defineProperty).toBe(0);
    expect(counts.getOwnPropertyDescriptor).toBe(0);
    Object.freeze(p);
    expect(counts.preventExtensions).toBe(1);
    expect(counts.isExtensible).toBe(0);
    expect(counts.defineProperty).toBe(1);
    expect(counts.getOwnPropertyDescriptor).toBe(1);
    expect(Object.isFrozen(p));
    expect(counts.preventExtensions).toBe(1);
    expect(counts.isExtensible).toBe(1);
    expect(counts.defineProperty).toBe(1);
    expect(counts.getOwnPropertyDescriptor).toBe(2);
  });

  test('seal detailed count', () => {
    const a = {b: ''};
    const counts = {
      preventExtensions: 0,
      isExtensible: 0,
      defineProperty: 0,
      getOwnPropertyDescriptor: 0,
    };
    const handler = {
      preventExtensions: (target: JsonObj) => {
        counts.preventExtensions += 1;
        Object.preventExtensions(target);
        return true;
      },
      isExtensible: (target: JsonObj) => {
        counts.isExtensible += 1;
        const result = Object.isExtensible(target);
        return result;
      },
      defineProperty: (
        target: JsonObj,
        property: string,
        descriptor: PropertyDescriptor
      ) => {
        counts.defineProperty += 1;
        Reflect.defineProperty(target, property, descriptor);
        return true;
      },
      getOwnPropertyDescriptor: (target: JsonObj, prop: string) => {
        counts.getOwnPropertyDescriptor += 1;
        const result = Object.getOwnPropertyDescriptor(target, prop);
        return result;
      },
    };
    const p = new Proxy(a, handler);
    expect(counts.preventExtensions).toBe(0);
    expect(counts.isExtensible).toBe(0);
    expect(counts.defineProperty).toBe(0);
    expect(counts.getOwnPropertyDescriptor).toBe(0);
    Object.seal(p);
    expect(counts.preventExtensions).toBe(1);
    expect(counts.isExtensible).toBe(0);
    expect(counts.defineProperty).toBe(1);
    expect(counts.getOwnPropertyDescriptor).toBe(0);
    expect(Object.isSealed(p));
    expect(counts.preventExtensions).toBe(1);
    expect(counts.isExtensible).toBe(1);
    expect(counts.defineProperty).toBe(1);
    expect(counts.getOwnPropertyDescriptor).toBe(1);
  });
});
