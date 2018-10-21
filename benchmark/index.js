import Benchmark from 'benchmark'
import * as R from 'ramda'
import hyperid from 'hyperid'

import SubX from '../src/index'

const uuid = hyperid()

const store = SubX.create({
  todos: []
})
const suite1 = new Benchmark.Suite()
suite1
  .add('array push', () => {
    R.range(0, 1000).forEach(i => store.todos.push({ title: i, completed: false }))
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()

const suite2 = new Benchmark.Suite()
let id = 0
suite2
  .add('fake uuid', () => {
    R.range(0, 100000).forEach(i => ++id)
  })
  .add('hyperid', () => {
    R.range(0, 100000).forEach(i => uuid())
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()
