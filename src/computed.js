import * as R from 'ramda'
import uuid from 'uuid/v4'

import { runAndMonitor } from './monitor'

const computed = (subx, f) => {
  const functionName = R.last(f.name.split(' ')) // `get f` => `f`
  let cache
  let stale = true
  const wrapped = () => {
    if (stale) {
      subx.compute_begin$.next({ type: 'COMPUTE_BEGIN', path: [functionName], id: uuid() })
      const { result, stream } = runAndMonitor(subx, f.bind(subx))
      cache = result
      stale = false
      const subscription = stream.subscribe(event => {
        stale = true
        subscription.unsubscribe()
        subx.stale$.next({ type: 'STALE', path: [functionName], root: event, cache, id: uuid() })
      })
      subx.compute_finish$.next({ type: 'COMPUTE_FINISH', path: [functionName], id: uuid() })
    }
    return cache
  }
  return wrapped
}

export default computed
