/* eslint-env jest */
import React from 'react'
import TestRenderer from 'react-test-renderer'

import SubX, { runAndMonitor } from '../src/index'

class Component extends React.Component {
  constructor (props) {
    super(props)
    const render = this.render.bind(this)
    this.render = () => {
      const stream = runAndMonitor(props, render).stream
      const sub = stream.subscribe(event => {
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
  test('default', () => {
    TestRenderer.create(<Footer store={store} />)
    expect(count).toBe(1)
    store.todos.push({ title: '111', completed: false })
    expect(count).toBe(2)
    store.todos.push({ title: '222', completed: false })
    expect(count).toBe(3)
    store.todos.push({ title: '333', completed: false })
    expect(count).toBe(4)
    store.todos.push({ title: '444', completed: false })
    expect(count).toBe(5)
  })
})
