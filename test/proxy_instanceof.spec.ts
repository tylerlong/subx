/* eslint-env jest */
describe('instanceof', () => {
  test('normal', () => {
    class A {
      constructor(a: {}, b: {}) {}
    }
    expect(new A({}, {}) instanceof A).toBe(true);
  });

  // in old versions of Node.js and Babel, it is possible to inherit Proxy
  // test('proxy', () => {
  //   class A extends Proxy {}
  //   expect(new A({}, {}) instanceof A).toBe(false)
  // })
});
