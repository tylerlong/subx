import { empty, merge } from 'rxjs'
import { filter, merge as _merge, publish, distinct, map } from 'rxjs/operators'
import * as R from 'ramda'

const monitorGets = (subx, gets) => {
  const relevantGets = R.reduce((events, event) =>
    (events.length > 0 && R.startsWith(R.last(events).path, event.path))
      ? R.update(events.length - 1, event, events) : R.append(event, events)
  )([], gets)
  const uniqGets = R.uniqBy(event => event.path, relevantGets)
  let stream = empty()
  R.forEach(get => {
    stream = merge(stream, subx.stale$.pipe(filter(event => R.equals(event.path, get.path))))
    const val = R.path(get.path, subx)
    if (val !== undefined) {
      stream = merge(stream, subx.delete$.pipe(filter(event => R.equals(event.path, get.path))))
    }
    stream = merge(stream, subx.set$.pipe(
      filter(event => R.startsWith(event.path, get.path)),
      filter(event => {
        const parentVal = R.path(R.init(get.path), subx)
        if (typeof parentVal === 'object' && parentVal !== null) {
          return val !== parentVal[R.last(get.path)]
        } else {
          return false // won't trigger stale when parent cannot have props
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
    if (val === true) {
      stream = merge(stream, subx.delete$.pipe(filter(event => R.equals(event.path, has.path))))
    }
    stream = merge(stream, subx.set$.pipe(
      filter(event => R.startsWith(event.path, has.path)),
      filter(event => {
        const parentVal = R.path(R.init(has.path), subx)
        if (typeof parentVal === 'object' && parentVal !== null) {
          return (R.last(has.path) in parentVal) !== val
        } else {
          return false // won't trigger stale when parent cannot have props
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
    stream = merge(stream, subx.delete$.pipe(
      filter(event => keys.path.length + 1 === event.path.length && R.startsWith(keys.path, event.path)),
      _merge(subx.set$.pipe(
        filter(event => R.startsWith(event.path, keys.path) || (keys.path.length + 1 === event.path.length && R.startsWith(keys.path, event.path))))),
      filter(event => {
        const parentVal = R.path(keys.path, subx)
        if (typeof parentVal === 'object' && parentVal !== null) {
          return !R.equals(Object.keys(parentVal), val)
        } else {
          return false // won't trigger stale when parent cannot have props
        }
      })
    ))
  }, uniqKeyss)
  return stream
}

export const monitor = (subx, { gets, hass, keyss }) => merge(monitorGets(subx, gets), monitorHass(subx, hass), monitorkeyss(subx, keyss)).pipe(distinct())

// TODO: maybe we can simply make SubX.create(subx) now
export const runAndMonitor = (subx, f) => {
  let kvs
  if (subx.__isSubX__) {
    kvs = [['__root__', subx]]
  } else {
    kvs = R.pipe(R.toPairs, R.filter(([k, v]) => v.__isSubX__))(subx)
  }
  const cache = {}
  const subscriptions = []
  R.forEach(([k, v]) => {
    cache[k] = { gets: [], hass: [], keyss: [] }
    let count = 0
    subscriptions.push(v.get$.subscribe(event => count === 0 && cache[k].gets.push(event)))
    subscriptions.push(v.has$.subscribe(event => count === 0 && cache[k].hass.push(event)))
    subscriptions.push(v.keys$.subscribe(event => count === 0 && cache[k].keyss.push(event)))
    subscriptions.push(v.compute_begin$.subscribe(event => { count += 1 }))
    subscriptions.push(v.compute_finish$.subscribe(event => { count -= 1 }))
  })(kvs)
  const result = f()
  R.forEach(subscription => subscription.unsubscribe(), subscriptions)
  let stream = empty()
  R.map(([k, v]) => {
    let tempStream = monitor(v, { gets: cache[k].gets, hass: cache[k].hass, keyss: cache[k].keyss })
    if (k !== '__root__') {
      tempStream = tempStream.pipe(map(event => R.assoc('path', [k, ...event.path], event)))
    }
    stream = merge(stream, tempStream)
  }, kvs)
  stream = stream.pipe(distinct(), publish()).refCount()
  return { result, stream }
}
