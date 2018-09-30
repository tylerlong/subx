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
  const functionName = R.last(f.name.split(' ')) // `get f` => `f`
  let cache
  let stale = true
  const wrapped = () => {
    if (stale) {
      const gets = []
      const hass = []
      const keyss = []
      const subscriptions = []
      let count = 0
      subscriptions.push(subx.get$$.subscribe(event => count === 0 && gets.push(event)))
      subscriptions.push(subx.has$$.subscribe(event => count === 0 && hass.push(event)))
      subscriptions.push(subx.keys$$.subscribe(event => count === 0 && keyss.push(event)))
      subx.compute_begin$.next({ type: 'COMPUTE_BEGIN', path: [functionName] })
      subx.compute_begin$$.subscribe(event => { count += 1 })
      subx.compute_finish$$.subscribe(event => { count -= 1 })
      cache = f.bind(subx)()
      stale = false
      R.forEach(subscription => subscription.unsubscribe(), subscriptions)
      subx.compute_finish$.next({ type: 'COMPUTE_FINISH', path: [functionName] })
      const stream = merge(monitorGets(subx, gets), monitorHass(subx, hass), monitorkeyss(subx, keyss))
      const subscription = stream.subscribe(event => {
        stale = true
        subscription.unsubscribe()
        subx.stale$.next({ type: 'STALE', path: [functionName] })
      })
    }
    return cache
  }
  return wrapped
}

export default computed
