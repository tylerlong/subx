import Benchmark from 'benchmark'
import * as R from 'ramda'

let id = 0
const uuid = () => ++id
const EVENT_NAMES = ['set$', 'delete$', 'get$', 'has$', 'keys$', 'compute_begin$', 'compute_finish$', 'stale$', 'transaction$']
const RESERVED_PROPERTIES = ['$', '__isSubX__', '__id__', '__emitEvent__', '__parents__', '__cache__', ...EVENT_NAMES]
const set = new Set(RESERVED_PROPERTIES)
const indexOf = i => RESERVED_PROPERTIES.indexOf(i) !== -1
const suite3 = new Benchmark.Suite()
suite3
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
