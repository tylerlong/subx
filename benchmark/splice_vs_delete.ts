import Benchmark, {Suite, Target} from 'benchmark';
import * as R from 'ramda';

type Parent = [{id: string}, string];

const suite = new Benchmark.Suite();
suite
  .add('splice', () => {
    for (let i = 0; i < 10000; i++) {
      const parents: Parent[] = [];
      parents.push([{id: 'aaa'}, 'child']);
      parents.push([{id: 'bbb'}, 'child']);
      parents.forEach(parent => parent);
      const index = R.findIndex(
        (parent: Parent) => parent[0].id === 'aaa',
        parents
      );
      parents.splice(index, 1);
      const index2 = R.findIndex(parent => parent[0].id === 'bbb', parents);
      parents.splice(index2, 1);
    }
  })
  .add('delete', () => {
    for (let i = 0; i < 10000; i++) {
      const parents: {[key: string]: Parent} = {};
      parents.aaa = [{id: 'aaa'}, 'child'];
      parents.bbb = [{id: 'bbb'}, 'child'];
      Object.keys(parents).forEach(k => parents[k]);
      delete parents.aaa;
      delete parents.bbb;
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
splice x 142 ops/sec ±0.92% (79 runs sampled)
delete x 249 ops/sec ±0.81% (88 runs sampled)
Fastest is delete
*/
