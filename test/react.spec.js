/* eslint-env jest */
import React from 'react'
import TestRenderer from 'react-test-renderer'
import { buffer, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

import SubX, { runAndMonitor } from '../src/index'

class Component extends React.Component {
  constructor (props) {
    super(props)
    const render = this.render.bind(this)
    this.render = () => {
      const stream = runAndMonitor(SubX.create(props), render).stream
      const bufferedStream = stream.pipe(buffer(stream.pipe(debounceTime(3))))
      const sub = bufferedStream.subscribe(event => {
        sub.unsubscribe()
        this.forceUpdate()
      })
      return ''
    }
  }
}

const store = SubX.create({
  todos: [],
  get leftCount () {
    return this.todos.filter(todo => !todo.completed).length
  }
})

let count = 0
class Footer extends Component {
  render () {
    count += 1
    if (this.props.store.todos.length === 0) {
      return ''
    }
    return this.props.store.leftCount
  }
}

describe('React', () => {
  test('default', async () => {
    TestRenderer.create(<Footer store={store} />)
    expect(count).toBe(1)
    store.todos.push({ title: '111', completed: false })
    expect(count).toBe(1) // because of debounce
    store.todos.push({ title: '222', completed: false })
    expect(count).toBe(1) // because of debounce
    await delay(5)
    expect(count).toBe(2)
  })
})
