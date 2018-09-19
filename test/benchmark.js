/* eslint-env jest */
let start

beforeEach(() => {
  start = new Date()
})

afterEach(() => {
  expect(new Date() - start).toBeLessThanOrEqual(25)
})
