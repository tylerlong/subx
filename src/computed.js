import * as R from 'ramda'
import uuid from 'uuid/v4'

import { monitor } from './monitor'

const computed = (subx, f) => {
  const functionName = R.last(f.name.split(' ')) // `get f` => `f`
  let cache
  let stale = true
  const wrapped = () => {
    if (stale) {
      subx.compute_begin$.next({ type: 'COMPUTE_BEGIN', path: [functionName], id: uuid() })
      const gets = []
      const hass = []
      const keyss = []
      const subscriptions = []
      let count = 0
      subscriptions.push(subx.get$.subscribe(event => count === 1 && gets.push(event)))
      subscriptions.push(subx.has$.subscribe(event => count === 1 && hass.push(event)))
      subscriptions.push(subx.keys$.subscribe(event => count === 1 && keyss.push(event)))
      subscriptions.push(subx.compute_begin$.subscribe(event => { count += 1 }))
      subscriptions.push(subx.compute_finish$.subscribe(event => { count -= 1 }))
      count += 1
      cache = f.bind(subx)()
      count -= 1
      stale = false
      R.forEach(subscription => subscription.unsubscribe(), subscriptions)
      const stream = monitor(subx, { gets, hass, keyss })
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
