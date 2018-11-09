/* eslint-env jest */
import SubX from '../src/index'

describe('Drake cases', () => {
  test('default', () => {
    const state = SubX.create({})
    state.subState = {
      hello: 'world',
      f: () => {
        return 1
      }
    }
    expect(state.subState.f).toBeDefined()
    expect(state.subState.f()).toBe(1)
  })

  test('alternative', () => {
    const state = SubX.create({})
    const SubState = new SubX({
      f: () => {
        return 2
      }
    })
    state.subState = new SubState({ hello: 'world' })
    expect(state.subState.f).toBeDefined()
    expect(state.subState.f()).toBe(2)
  })
})
