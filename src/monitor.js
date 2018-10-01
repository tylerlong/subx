import { empty, merge } from 'rxjs'
import * as R from 'ramda'
import { filter, merge as _merge } from 'rxjs/operators'

const monitorGets = (subx, gets) => {
  const relevantGets = R.reduce((events, event) =>
    (events.length > 0 && R.startsWith(events[0].path, event.path))
      ? R.update(0, event, events) : R.prepend(event, events)
  )([], gets)
  const uniqGets = R.uniqBy(event => event.path, relevantGets)
  let stream = empty()
  R.forEach(get => {
    stream = merge(stream, subx.stale$.pipe(filter(event => R.equals(event.path, get.path))))
    stream = merge(stream, subx.delete$.pipe(filter(event =>
      (get.path.length > event.path.length && R.startsWith(event.path, get.path)) ||
      (event.val !== undefined && R.equals(event.path, get.path))
    )))
    const val = R.path(get.path, subx)
    stream = merge(stream, subx.set$.pipe(
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
    stream = merge(stream, subx.delete$.pipe(filter(event =>
      (event.path.length < has.path.length && R.startsWith(event.path, has.path)) ||
      (val === true && R.equals(event.path, has.path))
    )))
    stream = merge(stream, subx.set$.pipe(
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
    stream = merge(stream, subx.delete$.pipe(filter(event => R.startsWith(event.path, keys.path))))
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
          return true
        }
      })
    ))
  }, uniqKeyss)
  return stream
}

const monitor = (subx, { gets, hass, keyss }) => merge(monitorGets(subx, gets), monitorHass(subx, hass), monitorkeyss(subx, keyss))

export default monitor
