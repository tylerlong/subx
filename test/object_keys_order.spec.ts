/* eslint-env jest */
import R from 'ramda';

describe('Object.keys order', () => {
  test('default', () => {
    expect(Object.keys({a: 1, b: 2})).toEqual(['a', 'b']);
    expect(Object.keys({b: 1, a: 2})).toEqual(['b', 'a']);

    expect(R.keys({a: 1, b: 2})).toEqual(['a', 'b']);
    expect(R.keys({b: 1, a: 2})).toEqual(['b', 'a']);
  });
});
