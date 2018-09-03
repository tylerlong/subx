import * as R from 'ramda'
import { Subject, never, merge } from 'rxjs'
import { map } from 'rxjs/operators'

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
  Model.computed = arg => {
    if (typeof arg === 'function') {
      const func = arg
      R.pipe(
        R.keys,
        R.forEach(key => {
          Model.prototype[key] = function (...args) {
            return func(this)[key](...args)
          }
          Model.prototype[`${key}$`] = function (stream) {
            const self = this
            return stream.pipe(map(() => self[key]()))
          }
        })
      )(func())
    } else { // type of arg === 'object'
      const obj = arg
      R.pipe(
        R.keys,
        R.forEach(key => {
          Model.prototype[key] = obj[key]
          Model.prototype[`${key}$`] = function (stream) {
            const self = this
            return stream.pipe(map(() => self[key]()))
          }
        })
      )(obj)
    }
    return Model
  }

  return Model
}

export default SubX
