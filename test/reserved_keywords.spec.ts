/* eslint-env jest */
import {Observable} from 'rxjs';

import SubX from '../src/index';

describe('Reserved keywords', () => {
  test('original data has keywords as prop', () => {
    const d = SubX.create({$: 2});
    expect(d.$).toBeInstanceOf(Observable);
    expect(JSON.stringify(d, null, 2)).toBe(`{
  "_$": 2
}`);
  });

  test('assign', () => {
    const p = SubX.create({});
    (p as any).$ = 'hello';
    (p as any).delete$ = 'world';
    expect(JSON.stringify(p, null, 2)).toBe(`{
  "_$": "hello",
  "_delete$": "world"
}`);
  });

  test('nested', () => {
    const p = SubX.create({a: {$: {}}, b: {}});
    p.b.get$ = 'wonderful';
    p.a._$.c = 'good';
    expect(JSON.stringify(p, null, 2)).toBe(`{
  "a": {
    "_$": {
      "c": "good"
    }
  },
  "b": {
    "_get$": "wonderful"
  }
}`);
  });
});
