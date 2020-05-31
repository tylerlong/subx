import Benchmark, {Suite, Target} from 'benchmark';
import * as R from 'ramda';

type Event = {
  path: string[];
};

const events: Event[] = [
  {path: ['a', 'b', 'c']},
  {path: ['a', 'b', 'c', 'd']},
  {path: ['a', 'b', 'c']},
  {path: ['a', 'b', 'c', 'd']},
  {path: ['a', 'b', 'c']},
  {path: ['a', 'b', 'c', 'd']},
  {path: ['a', 'b', 'c']},
  {path: ['a', 'b', 'c', 'd']},
  {path: ['a', 'b', 'c']},
  {path: ['a', 'b', 'c', 'd']},
];

const suite = new Benchmark.Suite();
suite
  .add('R.uniqBy arr', () => {
    for (let i = 0; i < 1000; i++) {
      R.reverse(R.uniqBy(event => event.path, R.reverse(events)));
    }
  })
  .add('R.uniqBy str', () => {
    for (let i = 0; i < 1000; i++) {
      R.reverse(R.uniqBy(event => event.path.join('.'), R.reverse(events)));
    }
  })
  .add('manual', () => {
    for (let i = 0; i < 1000; i++) {
      const cache: {[key: string]: Event} = {};
      const ids = [];
      for (let j = 0; j < events.length; j++) {
        const event = events[j];
        const id = event.path.join('.');
        cache[id] = event;
        const index = ids.indexOf(id);
        if (index !== -1) {
          ids.splice(index, 1);
        }
        ids.push(id);
      }
      ids.map(id => cache[id]);
    }
  })
  .on('cycle', (event: {target: string}) => {
    console.log(String(event.target));
  })
  .on('complete', function (this: Suite) {
    console.log(
      'Fastest is ' + this.filter('fastest').map((i: Target) => i.name)
    );
  })
  .run();

/*
R.uniqBy arr x 29.18 ops/sec ±0.73% (51 runs sampled)
R.uniqBy str x 227 ops/sec ±0.44% (86 runs sampled)
manual x 220 ops/sec ±1.26% (84 runs sampled)
Fastest is R.uniqBy str
*/
