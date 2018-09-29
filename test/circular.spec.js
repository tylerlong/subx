/* eslint-env jest */
describe('circular', () => {
  test('default', () => {
    const a = {}
    const b = {}
    a.b = b
    b.a = a
    expect(() => JSON.stringify(a)).toThrow(TypeError)
  })
})
