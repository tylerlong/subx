/* eslint-env jest */
import SubX from '../src/index';
import R from 'ramda';
import {JsonObj} from '../src/types';

describe('deep equal', () => {
  test('default', () => {
    const p = SubX.create({
      a: {b: 'hello'},
      c: {d: 'world'},
    });
    expect(
      R.equals(p as JsonObj, {
        a: {b: 'hello'},
        c: {d: 'world'},
      })
    ).toBeTruthy();
    expect(R.equals(p.c, {d: 'world'})).toBeTruthy();
    expect(p.c === {d: 'world'}).toBeFalsy();
  });
});
