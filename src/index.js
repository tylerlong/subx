import * as R from 'ramda'
import { Subject, never, merge } from 'rxjs'

const SubX = obj => {
  class Model {
    constructor () {
      // init properties and subjects
      this.$ = never()
      R.pipe(
        R.keys,
        R.forEach(key => {
          this[`_${key}`] = obj[key]
          this[`${key}$`] = new Subject()
          this.$ = merge(this.$, this[`${key}$`])
        })
      )(obj)
    }

    // for serialization and display
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

  // Produce data for subjects
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

  // computed properties
  Model.computed = obj => {
    // R.pipe(

    // )
    return Model
  }

  return Model
}

export default SubX
