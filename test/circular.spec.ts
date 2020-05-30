/* eslint-env jest */
describe('circular', () => {
  test('default', () => {
    const a: {b?: any} = {};
    const b: {a?: any} = {};
    a.b = b;
    b.a = a;
    expect(() => JSON.stringify(a)).toThrow(TypeError);
  });
});
