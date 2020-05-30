/* eslint-env jest */
import SubX from '../src/index';

describe('array glitch', () => {
  test('default', () => {
    const p = SubX.create([1, 2, 3]);
    let json;
    const sub = p.$.subscribe(e => {
      json = JSON.stringify(p);
      sub.unsubscribe();
    });
    p.splice(1, 1);
    // expect(json).toBe('[1,3,3]') // intermediate value, invalid
    expect(json).toBeUndefined(); // no more intermediate value because of transaction
  });

  test('transaction', () => {
    const p = SubX.create([1, 2, 3]);
    let json;
    const sub = p.transaction$.subscribe(e => {
      json = JSON.stringify(p);
      sub.unsubscribe();
    });
    p.splice(1, 1);
    expect(json).toBe('[1,3]');
  });
  /*
  Currently there is not perfect solution.
  Workaroud: buffer the stream before `subscribe`:
  `p.$.pipe(buffer(stream.pipe(debounceTime(2)))).subscribe`
  */

  /*
  Update: Now SubX support trasaction and this problem solved!
  */
});
