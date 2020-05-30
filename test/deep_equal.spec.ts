/* eslint-env jest */
import SubX from '../src/index';
import * as R from 'ramda';
import {ModelObj} from '../src/types';

describe('deep equal', () => {
  test('default', () => {
    const p = SubX.create({
      a: {b: 'hello'},
      c: {d: 'world'},
    });
    expect(
      R.equals(p as ModelObj, {
        a: {b: 'hello'},
        c: {d: 'world'},
      })
    ).toBeTruthy();
    expect(R.equals(p.c, {d: 'world'})).toBeTruthy();
    expect(p.c === {d: 'world'}).toBeFalsy();
  });
});
