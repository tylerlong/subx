/* eslint-env jest */
let start: number;

beforeEach(() => {
  start = new Date().getTime();
});

afterEach(() => {
  expect(new Date().getTime() - start).toBeLessThanOrEqual(
    parseInt(process.env.BENCHMARK_THRESHOLD ?? '30')
  );
});
