/* eslint-env jest */
import SubX from '../src/index'

describe('Symbol', () => {
  test('simple value return', () => {
    const store = SubX.create({ token: 1 })
    let count = 0
    SubX.autoRun(store, () => {
      count += 1
      return ({ token: store.token })
    })
    store.token = 2
    store.token = 3
    delete store.token

    expect(count).toBe(4)
  })

  test('complex value return', () => {
    const store = SubX.create({ token: { access_token: 1 } })
    let count = 0
    SubX.autoRun(store, () => {
      count += 1
      return ({ token: store.token })
    })
    store.token = 2
    store.token = 3
    delete store.token

    expect(count).toBe(4)
  })

  test('simple get', () => {
    const store = SubX.create({ token: { access_token: 1 } })
    let count = 0
    store.get$.subscribe(e => {
      count += 1
    })
    const i = store.token // eslint-disable-line no-unused-vars
    const j = store.token // eslint-disable-line no-unused-vars
    expect(count).toBe(2)
  })

  test('simple get 2', () => {
    const store = SubX.create({ token: 1 })
    let count = 0
    store.get$.subscribe(e => {
      count += 1
    })
    const i = store.token // eslint-disable-line no-unused-vars
    const j = store.token // eslint-disable-line no-unused-vars
    expect(count).toBe(2)
  })

  test('simple get 3', () => {
    const store = SubX.create({ token: 1 })
    let count = 0
    store.get$.subscribe(e => {
      count += 1
    })
    const i = { token: store.token } // eslint-disable-line no-unused-vars
    const j = { token: store.token } // eslint-disable-line no-unused-vars
    expect(count).toBe(2)
  })

  test('simple get 4', () => {
    const store = SubX.create({ token: { access_token: 1 } })
    let count = 0
    store.get$.subscribe(e => {
      count += 1
    })
    const i = { token: store.token } // eslint-disable-line no-unused-vars
    const j = { token: store.token } // eslint-disable-line no-unused-vars
    expect(count).toBe(2)
  })
})
