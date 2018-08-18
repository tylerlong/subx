import * as R from 'ramda'
import { Subject, merge } from 'rxjs'

const SubX = obj => {
  class Model {
    constructor () {
      R.pipe(
        R.toPairs,
        R.forEach(([key, val]) => {
          this[`_${key}`] = val
          this[`${key}$`] = new Subject()
        })
      )(obj)
      this.$ = merge(...R.pipe(R.keys, R.map(key => this[`${key}$`]))(obj))
    }
    toJSON () {
      return R.pipe(
        R.keys,
        R.map(key => [key, this[`_${key}`]]),
        R.fromPairs
      )(obj)
    }
    toString () {
      return `SubX ${JSON.stringify(this, null, 2)}`
    }
    inspect () {
      return this.toString()
    }
  }

  R.pipe(
    R.keys,
    R.forEach(key => {
      Object.defineProperty(Model.prototype, key, {
        get: function () {
          return this[`_${key}`]
        },
        set: function (val) {
          const oldVal = this[`_${key}`]
          this[`_${key}`] = val
          this[`${key}$`].next({ prop: key, val, oldVal })
        }
      })
    })
  )(obj)

  return Model
}

export default SubX
