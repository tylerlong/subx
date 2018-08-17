/* eslint-env jest */
import ReactiveModel from '../src/index'

describe('demo', () => {
  test('demo', () => {
    const MyModel = ReactiveModel({ counter: 0 })
    const myObj = new MyModel()

    myObj.subscribe(mutation => {
      console.log(mutation)
    })

    myObj.counter += 1
    myObj.counter = 5
    myObj.counter -= 2
    myObj.counter = 8
  })
})
