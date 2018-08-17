import * as R from 'ramda'
import { Subject } from 'rxjs'

const ReactiveClass = Cls => {
  const obj = new Cls()
  class NewCls extends Subject {
    constructor () {
      super()
      R.pipe(
        R.toPairs,
        R.forEach(([key, val]) => {
          this[`_${key}`] = val
        })
      )(obj)
    }
  };

  R.pipe(
    R.keys,
    R.forEach(key => {
      Object.defineProperty(NewCls.prototype, key, {
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

  return NewCls
}

export default ReactiveClass
