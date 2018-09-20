/* eslint-env jest */
import './benchmark'
// import SubX from '../src/index'

// const temp = proxy.$$.subscribe(event => receiver.$$.next(R.assoc('path', [prop, ...event.path], event)))
//       const temp2 = target.$.pipe(filter(event => event.path[0] === prop)).subscribe(() => {
//         temp.unsubscribe()
//         temp2.unsubscribe()
//       })

describe('stream types', () => {
  test('$', () => {
    // const person = SubX.create({ firstName: 'Tyler', lastName: 'Liu' })

    // let count1 = 0
    // person.$.subscribe(event => {
    //   count1 += 1
    // })

    // let count2 = 0
    // person.$.set$.subscribe(event => {
    //   count2 += 1
    // })

    // let count3 = 0
    // person.$.delete$.subscribe(event => {
    //   count3 += 1
    // })

    // person.firstName = 'Peter'
    // delete person.lastName

    // expect(count1).toBe(2)
    // expect(count2).toBe(1)
    // expect(count3).toBe(1)
  })
})
