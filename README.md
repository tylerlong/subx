# Discontinued

This project has been replaced by [manate](https://github.com/tylerlong/manate).

# SubX

[![Build Status](https://travis-ci.org/tylerlong/subx.svg?branch=master)](https://travis-ci.org/tylerlong/subx)
[![npm version](https://badge.fury.io/js/subx.svg)](https://badge.fury.io/js/subx)

SubX is next generation state container. It could replace Redux and MobX in React apps.

Subject X, Reactive Subject. Pronunciation: [Sub X]


## react-subx

If you want to use SubX together with React, please check [react-subx](https://github.com/tylerlong/react-subx).


## Features (compared to Redux or MobX)

- [Developer-friendly](https://gist.github.com/tylerlong/a5d7d179fb75415e9971f9a720f5c907): fewer lines of code to write, fewer new concepts to learn & master.
- Intuitive, just follow common sense. No annotation or weird configuration / syntax.
- Performant, it helps us to minimize backend computation and frontend rendering.
- Based on RxJS, we can use [ALL the RxJS operators](https://www.learnrxjs.io/operators/).
- Schemaless, we don't need to specify all our data fields at the beginning. We can add them gradually and dynamically.
- Small. 400 lines of code. (Unbelievable, huh?) We've written 5000+ lines of testing code to cover the tiny core.


## Installation

```
yarn add subx
```

```js
import SubX from 'subx'
```


## Quickstart sample

```js
const person = SubX.create()
person.$.subscribe(console.log)
person.firstName = 'Tyler'
person.lastName = 'Long'
```

#### Console output

```
{ type: 'SET', path: ['firstName'], id: 'uuid-1' }
{ type: 'SET', path: ['lastName'], id: 'uuid-2' }
```

In the sample code above, `person` is a SubX object. `person.$` is a stream of events about changes to `person`'s properties.

If you know `RxJS`, I would like to mention that `person.$` is an [Observable](http://reactivex.io/documentation/observable.html).


## What is a SubX Object / Reactive Subject?

Subject is the similar concept as the subject in [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).

A reactive subject is a special JavaScript object which allows us to subscribe to its **events**. If you are a React + Redux developer, events is similar to **actions**. If you are a Vue.js + Vuex developer, events is similar to **mutations**.

In content below, we call a reactive subject a **SubX object**.

It is easy to convert a SubX object to a plain object: `const plainObj = subxObj.toObject()`.


## Types of events

Currently there are 5 basic events: `SET`, `DELETE`, `GET`, `HAS` & `KEYS`.
The corresponding event streams are `set$`, `delete$`, `get$`, `has$` & `keys$`

There are 3 advanced events: `COMPUTE_BEGIN`, `COMPUTE_FINISH` & `STALE`.
The corresponding event streams are `compute_begin$`, `compute_finish$` & `stale$`.


### `set$` & `$`

Most of the event mentioned in this page are `SET` events. `SET` means a property has been assigned to. Such as `person.firstName = 'John'`.

```js
const person = SubX.create({ firstName: 'Tyler' })
person.set$.subscribe(console.log)
person.firstName = 'Peter'
```

**`$` is a synonym of `set$`**. We provide it as sugar since `set$` is the mostly used event.

### `delete$`

`DELETE` events are triggered as well. We already see one of such event above in "Array events" section. Here is one more sample:

```js
const person = SubX.create({ firstName: '' })
person.delete$.subscribe(console.log)
delete person.firstName
```

### `get$`

`GET` events are triggered when we access a property

```js
const person = SubX.create({ firstName: '' })
person.get$.subscribe(console.log)
console.log(person.firstName)
```

### `has$`

`GET` events are triggered when we use the `in` operator

```js
const person = SubX.create({ firstName: '' })
person.has$.subscribe(console.log)
console.log('firstName' in person)
```

### `keys$`

`KEYS` events are triggered when we use `Object.keys(...)`

```js
const person = SubX.create({ firstName: '' })
person.keys$.subscribe(console.log)
console.log(Object.keys(person))
```

### `compute_begin$`, `compute_end$` & `state$`

These 3 events are advanced. Most likely we don't need to know them.
They are for computed properties(which is covered below).

- `COMPUTE_BEGIN` is triggered when a computed property starts to compute.
- `COMPUTE_FINISH` is triggered when a computed property finishes computing.
- `STALE` is triggered when the computed property becomes "stale", which means a re-compute is necessary.


## Getters / Computed properties

We use "convention over configuration" here: getter functions are computed properties. If we don't need it to be computed property, just don't make it a getter function.

So in SubX, "computed properties" and "getters" are synonyms. We use them interchangeably.

```js
const Person = SubX.model({
    firstName: 'San',
    lastName: 'Zhang',
    get fullName () {
        return `${this.firstName} ${this.lastName}`
    }
})
const person = Person.create()
expect(person.fullName).toBe('San Zhang')
```

What is the different between computed property and a normal function? Computed property caches its results, it won't re-compute until necessary.

So in the example above, we can call `person.fullName` multiple times but it will only compute once. It won't re-compute until we change either `firstName` or `lastName` and invoke `person.fullName` again.

I would recommend using as many getters as we can if our data don't change much. Because they can cache data to improve performance dramatically.

Computed properties / getters are supposed to be "pure". We should not update data in them. If we want to update data, define a normal function instead of a getter function.


## `autoRun`

The signature of `autoRun` is

```js
// autoRun :: (subx, f, ...operators) -> stream$
```

Method signature explained:

- First agument `subx` is a SubX object
- Second arugment `f` is an action/function
- Remaining arguments `...operators` are RxJS operators
- Return type `stream$` is a stream (RxJS Subject)

#### How does `autoRun` work:

1. When we invoke `autoRun`, the second argument `f` is invoked immediately.
1. Then the the first argument `subx` is monitored.
1. Whenever `subx` changes which might affect the result of `f`, `f` is invoked again.
1. The invocation of `f` is further controlled by `...operators`.
1. The result of `f()` are directed to the returned `stream$`
1. We can `stream$.subscribe(...)` to consume the results of `f()`
1. We can `stream$.complete()` to stop the whole monitor & autoRun process described above.


#### [Sample code using `autoRun`](./test/autoRun.spec.ts)


## `runAndMonitor`

`runAndMonitor` is low level API which powers `autoRun`. If for some reason `autoRun` is not flexible enough to meet your requirements, you can give `runAndMonitor` a try.

The signature of `runAndMonitor` is:

```js
// runAndMonitor :: subx, f -> { result, stream$ }
```

Method signature explained:

- First agument `subx` is a SubX object
- Second arugment `f` is an action/function
- Return type is an object which containers two properties:
    - `result` is the result of `f()`
    - `stream$` is a stream (RxJS Subject)

#### How does `runAndMonitor` work:

1. When we invoke `runAndMonitor`, the second argument `f` is invoked immediately.
1. Result of `f()` is saved into `result`
1. Then the the first argument `subx` is monitored.
1. Changes to `subx` which might affect the result of next invocation of `f` are redirected to `stream$`
1. `{ result, stream$ }` is returned
1. We can `stream$.pipe(...operators).subscribe(...)` to react to the stream events (possibly invoke `f` again)

#### Sample code using `runAndMonitor`

- [test/react_fake.spec.ts](test/react_fake.spec.ts)
- [test/monitor_delete.spec.ts](test/monitor_delete.spec.ts)
- [test/react.spec.ts](test/react.spec.ts)
- [test/runAndMonitor_path.spec.ts](test/runAndMonitor_path.spec.ts)


## Recursive

By default, a SubX Object is recursive. Which means, all of its property objects are also SubX objects. For example:

```js
const p = SubX.create({ a: {}, b: {} })
```

`p` is a SubX object, so are `p.a` and `p.b`.


You can disable the recursive behavior:

```js
const p1 = SubX.create({ a: {}, b: {} }, false)
const P = SubX.model({ a: {}, b: {} }, false)
const p2 = P.create()
```

`p1` and `p2` are SubX objects while none of `p1.a`, `p1.b`, `p2.a`, `p2.b` are SubX objects.


### Convert recursive to non-recursive

```js
let p = SubX.create({ a: {}, b: {} })
p = SubX.create(p.toObject(), false)
```

### Convert non-recursive to recursive

```js
let p = SubX.create({ a: {}, b: {} }, false)
p = SubX.create(p)
```


## Pitfalls

### Circular data

If we create circular data structure with SubX, the behavior is undefined. Please don't do that.


## More info

Please read the [wiki](https://github.com/tylerlong/subx/wiki). We have a couple of useful pages there.

Our [test cases](https://github.com/tylerlong/subx/tree/master/test) have lots of interesting ideas too.
