/* eslint-env jest */
import SubX from '../src/index';

describe('', () => {
  test('complex value console.log', () => {
    const store = SubX.create({token: {access_token: 1}});
    let count = 0;
    SubX.autoRun(store, () => {
      count += 1;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const i = JSON.stringify({token: store.token});
    });
    store.token = 2;
    store.token = 3;
    delete store.token;

    expect(count).toBe(4);
  });
});
