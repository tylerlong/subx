/* eslint-env jest */
import SubX from '../build/index'

describe('', () => {
  test('complex value console.log', () => {
    const store = SubX.create({ token: { access_token: 1 } })
    let count = 0
    SubX.autoRun(store, () => {
      count += 1
      const i = JSON.stringify({ token: store.token }) // eslint-disable-line no-unused-vars
    })
    store.token = 2
    store.token = 3
    delete store.token

    expect(count).toBe(4)
  })
})
