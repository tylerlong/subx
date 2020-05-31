/* eslint-env jest */

import SubX from '../src/index';

describe('non recursive', () => {
  test('recursive', () => {
    const rectangle = SubX.create({position: {}, size: {}});
    let count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(4);
  });

  test('recursive 2', () => {
    const Rectangle = SubX.model({position: {}, size: {}});
    const rectangle = Rectangle.create();
    let count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(4);
  });

  test('non recursive', () => {
    const rectangle = SubX.create({position: {}, size: {}}, false);
    let count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(0);
    rectangle.position = {x: 1, y: 2};
    expect(count).toBe(1);
  });

  test('non recursive 2', () => {
    const Rectangle = SubX.model({position: {}, size: {}}, false);
    const rectangle = Rectangle.create();
    let count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(0);
    rectangle.position = {x: 1, y: 2};
    expect(count).toBe(1);
  });

  test('change recursive to non-recursive', () => {
    let rectangle = SubX.create({position: {}, size: {}});
    let count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(4);

    // convert it
    rectangle = SubX.create(rectangle.toObject(), false);
    count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(0);
  });

  test('change non-recursive to recursive', () => {
    let rectangle = SubX.create({position: {}, size: {}}, false);
    let count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(0);

    // convert it
    rectangle = SubX.create(rectangle);
    count = 0;
    rectangle.$.subscribe(e => {
      count += 1;
    });
    rectangle.position.x = 0;
    rectangle.position.y = 0;
    rectangle.size.width = 200;
    rectangle.size.height = 100;
    expect(count).toBe(4);
  });

  test('change child to non recursive', () => {
    const p = SubX.create({a: {b: {c: 1}}});
    let count = 0;
    p.$.subscribe(e => {
      count += 1;
    });
    p.a.b.c = 2;
    expect(count).toBe(1);
    p.a = SubX.create(p.a.toObject(), false); // p.a becomes non-recursive
    count = 0;
    p.a.b.c = 3;
    expect(count).toBe(0);
  });

  test('change child to recursive', () => {
    const p = SubX.create({a: {b: {c: 1}}}, false);
    let count = 0;
    p.$.subscribe(e => {
      count += 1;
    });
    p.a.b.c = 2;
    expect(count).toBe(0);
    p.a = SubX.create(p.a); // p.a becomes recursive
    count = 0;
    p.a.b.c = 3;
    expect(count).toBe(1);
  });
});
