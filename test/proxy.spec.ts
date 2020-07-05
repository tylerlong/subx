/* eslint-env jest */
import * as R from 'ramda';
import {JsonObj} from '../src/types';

describe('test', () => {
  test('proxy for object properties', () => {
    let count = 0;
    const handler = {
      set: (target: JsonObj, property: string, value: any) => {
        count += 1;
        target[property] = value;
        // console.log('prop changed')
        return true;
      },
    };
    const person = {
      firstName: 'San',
      lastName: 'Zhang',
    };
    const p = new Proxy(person, handler);
    p.firstName = 'Si';
    person.firstName = 'Wu';
    person.firstName = 'Chuntao';
    expect(count).toBe(1); // assign to target doesn't invoke handler.set
  });
  test('proxy for array', () => {
    const handler = {
      deleteProperty: function (target: JsonObj, property: string) {
        delete target[property];
        // console.log('Deleted %s', property)
        return true;
      },
      set: function (target: JsonObj, property: string, value: any) {
        target[property] = value;
        // console.log('Set %s to %o', property, value)
        return true;
      },
    };
    const a = [1, 2, 3, 4, 5, 6];
    const p = new Proxy(a, handler);
    p[1] = 100;
    // console.log(p)
    p.push(7);
    // console.log(p)
    p.splice(1, 3);
    // console.log(p)
  });
  test('delete obj property', () => {
    const handler = {
      deleteProperty: function (target: JsonObj, property: string) {
        expect(R.keys(target).length).toBe(3); // deletion hasn't performed
        // console.log('Deleted %s', property)
        delete target[property];
        return true;
      },
      set: function (target: JsonObj, property: string, value: any) {
        target[property] = value;
        // console.log('Set %s to %o', property, value)
        return true;
      },
    };
    const p = new Proxy({a: 1, b: 2, c: {}}, handler);
    delete p.b;
    p.c = 4; // this doesn't trigger delete c first
  });
  test('delete array elements', () => {
    const handler = {
      deleteProperty: function (target: JsonObj, property: string) {
        // console.log('Deleted %s', property)
        delete target[property];
        return true;
      },
      set: function (target: JsonObj, property: string, value: any) {
        target[property] = value;
        // console.log('Set %s to %o', property, value)
        return true;
      },
    };
    const p = new Proxy([1, 2, 3], handler);
    delete p[1];
    // console.log(p)
    p.shift();
    // console.log(p)
  });
  test('handler.has', () => {
    const o = {};
    let count1 = 0;
    let count2 = 0;
    const handler = {
      get: (target: JsonObj, prop: string) => {
        count1 += 1;
        return target[prop];
      },
      has: (target: JsonObj, prop: string) => {
        count2 += 1;
        return prop in target;
      },
    };
    const p = new Proxy(o, handler);
    expect('a' in p).toBe(false);
    expect(count2).toBe(1);
    p.a = 1;
    expect('a' in p).toBe(true);
    expect(count1).toBe(0);
    expect(count2).toBe(2);
  });
});
