/* eslint-env jest */
import {filter, map, publish, share, refCount} from 'rxjs/operators';
import {Subject} from 'rxjs';

import SubX from '../src/index';

describe('lazy stream', () => {
  test('no subscriber', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      })
    );
    expect(lazyStream).toBeDefined();
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(0); // because no subscriber.
  });

  test('late subscriber', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      })
    );
    expect(lazyStream).toBeDefined();
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    lazyStream.subscribe(() => {});
    expect(count).toBe(0); // because subscriber too late
  });

  test('single subscriber', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      })
    );
    expect(lazyStream).toBeDefined();
    lazyStream.subscribe(() => {});
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(4);
  });

  test('mutiple subscribers', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      })
    );
    expect(lazyStream).toBeDefined();
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(12); // this is bad!
  });

  test('mutiple subscribers publish & refCount', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      }),
      publish(),
      refCount()
    );
    expect(lazyStream).toBeDefined();
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(4);
  });

  test('no subscriber publish & refCount', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      }),
      publish(),
      refCount()
    );
    expect(lazyStream).toBeDefined();
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(0);
  });

  test('mutiple subscribers share', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      }),
      share()
    );
    expect(lazyStream).toBeDefined();
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(4);
  });

  test('no subscriber share', () => {
    const p = SubX.create({});
    let count = 0;
    const lazyStream = p.$.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      }),
      share()
    );
    expect(lazyStream).toBeDefined();
    p.firstName = 'Tyler';
    p.lastName = 'Liu';
    expect(count).toBe(0);
  });

  test('rxjs subject', () => {
    const p = new Subject();
    let count = 0;
    const lazyStream = p.pipe(
      filter(() => {
        count += 1;
        return true;
      }),
      map(event => {
        count += 1;
        return event;
      }),
      publish(),
      refCount()
    );
    expect(lazyStream).toBeDefined();
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    lazyStream.subscribe(() => {});
    p.next('Tyler');
    p.next('Liu');
    expect(count).toBe(4);
  });
});
