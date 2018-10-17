import { merge, BehaviorSubject } from 'rxjs'
import { filter, merge as _merge, publish, distinct } from 'rxjs/operators'
import * as R from 'ramda'
import uuid from 'uuid/v4'

const monitorGets = (subx, gets) => {
  const relevantGets = R.reduce((events, event) =>
    (events.length > 0 && R.startsWith(R.last(events).path, event.path))
      ? R.update(events.length - 1, event, events) : R.append(event, events)
  )([], gets)
  const uniqGets = R.uniqBy(event => event.path, relevantGets)
  const streams = []
  R.forEach(get => {
    streams.push(subx.stale$.pipe(filter(event => R.equals(event.path, get.path))))
    const val = R.path(get.path, subx)
    if (val !== undefined) {
      streams.push(subx.delete$.pipe(filter(event => R.equals(event.path, get.path))))
    }
    streams.push(subx.set$.pipe(
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
  return streams
}

const monitorHass = (subx, hass) => {
  const uniqHass = R.uniqBy(has => has.path, hass)
  const streams = []
  R.forEach(has => {
    const val = R.last(has.path) in R.path(R.init(has.path), subx)
    if (val === true) {
      streams.push(subx.delete$.pipe(filter(event => R.equals(event.path, has.path))))
    }
    streams.push(subx.set$.pipe(
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
  return streams
}

const monitorkeyss = (subx, keyss) => {
  const uniqKeyss = R.uniqBy(keys => keys.path, keyss)
  const streams = []
  R.forEach(keys => {
    const val = Object.keys(R.path(keys.path, subx))
    streams.push(subx.delete$.pipe(
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
  return streams
}

// a subx obj and one of its children attached to the same parent (props of React)
export const removeDuplicateEvents = events => R.reduce((result, event) => {
  if (result.length === 1 && result[0].id === event.id) {
    return [event]
  }
  if (result.length >= 2 && event.id === R.last(result).id) {
    if (R.startsWith(R.last(R.init(result)).path, R.last(result).path)) {
      return result
    } else {
      return R.update(result.length - 1, event, result)
    }
  }
  return R.append(event, result)
})([], events)

const monitor = (subx, { gets, hass, keyss }) => {
  return merge(
    ...monitorGets(subx, removeDuplicateEvents(gets)),
    ...monitorHass(subx, removeDuplicateEvents(hass)),
    ...monitorkeyss(subx, removeDuplicateEvents(keyss))
  ).pipe(distinct(), publish()).refCount()
}

export const runAndMonitor = (subx, f) => {
  const gets = []
  const hass = []
  const keyss = []
  let count = 0
  const subscriptions = []
  subscriptions.push(subx.get$.subscribe(event => count === 1 && gets.push(event)))
  subscriptions.push(subx.has$.subscribe(event => count === 1 && hass.push(event)))
  subscriptions.push(subx.keys$.subscribe(event => count === 1 && keyss.push(event)))
  subscriptions.push(subx.compute_begin$.subscribe(event => { count += 1 }))
  subscriptions.push(subx.compute_finish$.subscribe(event => { count -= 1 }))
  count += 1
  const result = f()
  count -= 1
  R.forEach(subscription => subscription.unsubscribe(), subscriptions)
  const stream = monitor(subx, { gets, hass, keyss })
  return { result, stream }
}

export const computed = (subx, f) => {
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

export const autoRun = (subx, f, ...operators) => {
  let results$
  let subscription
  const run = () => {
    const { result, stream } = runAndMonitor(subx, f)
    if (!results$) {
      results$ = new BehaviorSubject(result)
    } else {
      results$.next(result)
    }
    subscription = stream.pipe(...operators).subscribe(event => {
      subscription.unsubscribe()
      run()
    })
  }
  run()
  results$.subscribe(undefined, undefined, () => { // complete
    subscription.unsubscribe()
  })
  return results$
}
