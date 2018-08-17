import * as R from 'ramda'
import { Subject } from 'rxjs'

const ReactiveModel = obj => {
  class Model extends Subject {
    constructor () {
      super()
      R.pipe(
        R.toPairs,
        R.forEach(([key, val]) => {
          this[`_${key}`] = val
        })
      )(obj)
    }
    toJSON () {
      return R.pipe(
        R.keys,
        R.map(key => [key, this[`_${key}`]]),
        R.fromPairs
      )(obj)
    }
    toString () {
      return `ReactiveModel ${JSON.stringify(this, null, 2)}`
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
          this.next({ prop: key, val, oldVal })
        }
      })
    })
  )(obj)

  return Model
}

export default ReactiveModel
