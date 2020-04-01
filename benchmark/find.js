import Benchmark from 'benchmark'
import * as R from 'ramda'

let id = 0
const uuid = () => ++id
const EVENT_NAMES = ['set$', 'delete$', 'get$', 'has$', 'keys$', 'compute_begin$', 'compute_finish$', 'stale$', 'transaction$']
const RESERVED_PROPERTIES = ['$', '__isSubX__', '__id__', '__recursive__', '__emitEvent__', '__parents__', '__cache__', '@@functional/placeholder', ...EVENT_NAMES]
const set = new Set(RESERVED_PROPERTIES)
const indexOf = i => RESERVED_PROPERTIES.indexOf(i) !== -1
const suite = new Benchmark.Suite()
suite
  .add('R.contains', () => {
    for (let i = 0; i < 100000; i++) {
      R.contains(uuid(), RESERVED_PROPERTIES)
    }
  })
  .add('Set', () => {
    for (let i = 0; i < 100000; i++) {
      set.has(uuid())
    }
  })
  .add('indexOf', () => {
    for (let i = 0; i < 100000; i++) {
      indexOf(uuid())
    }
  })
  .add('includes', () => {
    for (let i = 0; i < 100000; i++) {
      RESERVED_PROPERTIES.includes(uuid())
    }
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()

/*
R.contains x 372 ops/sec ±1.16% (79 runs sampled)
Set x 484 ops/sec ±0.79% (87 runs sampled)
indexOf x 524 ops/sec ±0.79% (89 runs sampled)
includes x 410 ops/sec ±0.39% (92 runs sampled)
Fastest is indexOf
*/

/*
Latest:
R.contains x 749 ops/sec ±1.66% (91 runs sampled)
Set x 667 ops/sec ±0.31% (93 runs sampled)
indexOf x 739 ops/sec ±0.91% (93 runs sampled)
includes x 2,705 ops/sec ±24.84% (44 runs sampled)
Fastest is includes
*/
