import * as R from 'ramda'

const ReactiveClass = Cls => {
  const obj = new Cls()
  class NewCls {
    constructor() {
      R.pipe(
        R.toPairs,
        R.forEach(([key, val]) => {
          this[key] = val
        })
      )(obj)
    }
  }
  return NewCls
}

export default ReactiveClass
