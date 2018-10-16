import { empty, merge, BehaviorSubject } from 'rxjs'
import { filter, merge as _merge, publish, distinct } from 'rxjs/operators'
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

export const removeDuplicateEvents = events => { // a subx obj and one of its children attached to the same this.props
  return R.reduce((result, event) => {
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
}

export const monitor = (subx, { gets, hass, keyss }) => {
  return merge(
    monitorGets(subx, removeDuplicateEvents(gets)),
    monitorHass(subx, removeDuplicateEvents(hass)),
    monitorkeyss(subx, removeDuplicateEvents(keyss))
  ).pipe(distinct())
}

export const runAndMonitor = (subx, f) => {
  const gets = []
  const hass = []
  const keyss = []
  let count = 0
  const subscriptions = []
  subscriptions.push(subx.get$.subscribe(event => count === 0 && gets.push(event)))
  subscriptions.push(subx.has$.subscribe(event => count === 0 && hass.push(event)))
  subscriptions.push(subx.keys$.subscribe(event => count === 0 && keyss.push(event)))
  subscriptions.push(subx.compute_begin$.subscribe(event => { count += 1 }))
  subscriptions.push(subx.compute_finish$.subscribe(event => { count -= 1 }))
  const result = f()
  R.forEach(subscription => subscription.unsubscribe(), subscriptions)
  const stream = monitor(subx, { gets, hass, keyss }).pipe(publish()).refCount()
  return { result, stream }
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
