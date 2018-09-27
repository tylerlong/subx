import * as R from 'ramda'
import { empty, merge } from 'rxjs'
import { filter } from 'rxjs/operators'

const monitorGets = (subx, gets) => {
  const relevantGets = R.reduce((events, event) =>
    (events.length > 0 && R.startsWith(events[0].path, event.path))
      ? R.update(0, event, events) : R.prepend(event, events)
  )([], gets)
  const uniqGets = R.uniqBy(event => event.path, relevantGets)
  let stream = empty()
  R.forEach(get => {
    const val = R.path(get.path, subx)
    stream = merge(stream, subx.$$.pipe(
      filter(event => R.startsWith(event.path, get.path)),
      filter(event => {
        const parentVal = R.path(R.init(get.path), subx)
        if (typeof parentVal === 'object' && parentVal !== null) {
          return val !== parentVal[R.last(get.path)]
        } else {
          return true
        }
      })
    ))
  }, uniqGets)
  return stream
}

const monitorHass = (subx, hass) => {
  const uniqHass = R.uniqBy(has => has.path, hass)
  let stream = empty()
  R.forEach(has => {
    const val = R.last(has.path) in R.path(R.init(has.path), subx)
    stream = merge(stream, subx.$$.pipe(
      filter(event => R.startsWith(event.path, has.path)),
      filter(event => {
        const parentVal = R.path(R.init(has.path), subx)
        if (typeof parentVal === 'object' && parentVal !== null) {
          return R.last(has.path) in parentVal !== val
        } else {
          return true
        }
      })
    ))
  }, uniqHass)
  return stream
}

const monitorkeyss = (subx, keyss) => {
  const uniqKeyss = R.uniqBy(keys => keys.path, keyss)
  let stream = empty()
  R.forEach(keys => {
    const val = Object.keys(R.path(keys.path, subx))
    stream = merge(stream, subx.$$.pipe(
      filter(event => R.startsWith(event.path, keys.path) || (keys.path.length + 1 === event.path.length && R.startsWith(keys.path, event.path))),
      filter(event => {
        const parentVal = R.path(keys.path, subx)
        if (typeof parentVal === 'object' && parentVal !== null) {
          return !R.equals(Object.keys(parentVal), val)
        } else {
          return true
        }
      })
    ))
  }, uniqKeyss)
  return stream
}

const computed = (subx, f) => {
  let cache
  let changed = true
  const wrapped = () => {
    if (changed) {
      const gets = []
      const hass = []
      const keyss = []
      const subscriptions = []
      subscriptions.push(subx.get$$.subscribe(event => gets.push(event)))
      subscriptions.push(subx.has$$.subscribe(event => hass.push(event)))
      subscriptions.push(subx.keys$$.subscribe(event => keyss.push(event)))
      cache = f.bind(subx)()
      changed = false
      R.forEach(subscription => subscription.unsubscribe(), subscriptions)
      const stream = merge(monitorGets(subx, gets), monitorHass(subx, hass), monitorkeyss(subx, keyss))
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
