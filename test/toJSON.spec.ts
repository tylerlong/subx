/* eslint-env jest */
import SubX from '../src/index';

describe('toJSON', () => {
  test('index', () => {
    const p = SubX.create({a: {b: {c: 'd'}}});
    expect(p.toJSON()).toEqual({a: {b: {c: 'd'}}});
  });

  test('array of SubX objects', () => {
    const p1 = SubX.create({a: {b: {c: 'd'}}});
    const p2 = SubX.create({a: {b: {c: 'd'}}});
    const p3 = SubX.create([p1, p2]);
    expect(JSON.stringify(p3)).toBe(
      '[{"a":{"b":{"c":"d"}}},{"a":{"b":{"c":"d"}}}]'
    );
    expect(JSON.stringify(p3.toJSON())).toBe(
      '[{"a":{"b":{"c":"d"}}},{"a":{"b":{"c":"d"}}}]'
    );
  });
});
