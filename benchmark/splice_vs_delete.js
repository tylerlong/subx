import Benchmark from 'benchmark'
import * as R from 'ramda'

const suite = new Benchmark.Suite()
suite
  .add('splice', () => {
    for (let i = 0; i < 10000; i++) {
      const parents = []
      parents.push([{ id: 'aaa' }, 'child'])
      parents.push([{ id: 'bbb' }, 'child'])
      parents.forEach(parent => parent)
      const index = R.findIndex(parent => parent[0].id === 'aaa', parents)
      parents.splice(index, 1)
      const index2 = R.findIndex(parent => parent[0].id === 'bbb', parents)
      parents.splice(index2, 1)
    }
  })
  .add('delete', () => {
    for (let i = 0; i < 10000; i++) {
      const parents = { }
      parents.aaa = [{ id: 'aaa' }, 'child']
      parents.bbb = [{ id: 'bbb' }, 'child']
      Object.keys(parents).forEach(k => parents[k])
      delete parents.aaa
      delete parents.bbb
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
splice x 142 ops/sec ±0.92% (79 runs sampled)
delete x 249 ops/sec ±0.81% (88 runs sampled)
Fastest is delete
*/
