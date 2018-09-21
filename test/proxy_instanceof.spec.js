/* eslint-env jest */
describe('instanceof', () => {
  test('normal', () => {
    class A {}
    expect(new A({}, {}) instanceof A).toBe(true)
  })

  test('proxy', () => {
    class A extends Proxy {}
    expect(new A({}, {}) instanceof A).toBe(false)
  })
})
