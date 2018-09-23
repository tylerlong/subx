import * as R from 'ramda'
import { empty, merge } from 'rxjs'
import { filter } from 'rxjs/operators'

const monitorGets = (subx, gets) => {
  const relevantGets = R.reduce((events, event) => {
    if (events.length > 0 && R.startsWith(events[0].path, event.path)) {
      events.shift()
    }
    events.unshift(event)
    return events
  }, [], gets)
  let stream = empty()
  R.forEach(get => {
    const val = R.path(get.path, subx)
    stream = merge(stream, subx.$.pipe(
      filter(event => R.startsWith(event.path, get.path)),
      filter(event => !R.equals(val, R.path(get.path, subx)))
    ))
  }, relevantGets)
  return stream
}

const computed = (subx, f) => {
  let cache
  let changed = true
  const wrapped = () => {
    if (changed) {
      const gets = []
      const subscriptions = []
      subscriptions.push(subx.get$.subscribe(event => gets.push(event)))
      cache = f.bind(subx)()
      changed = false
      R.forEach(subscription => subscription.unsubscribe(), subscriptions)
      const stream = merge(monitorGets(subx, gets))
      const subscription = stream.subscribe(event => {
        changed = true
        subscription.unsubscribe()
      })
    }
    return cache
  }
  return wrapped
}

export default computed
