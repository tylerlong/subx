/* eslint-env jest */
let start

beforeEach(() => {
  start = new Date()
})

afterEach(() => {
  expect(new Date() - start).toBeLessThanOrEqual(process.env.BENCHMARK_THRESHOLD || 20)
})
