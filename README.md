# SubX

[![Build Status](https://travis-ci.org/tylerlong/subx.svg?branch=master)](https://travis-ci.org/tylerlong/subx)
[![npm version](https://badge.fury.io/js/subx.svg)](https://badge.fury.io/js/subx)

SubX is next generation state container. It could replace Redux and MobX in our React apps.

Subject X, Reactive Subject. Pronunciation: [Sub X]


## react-subx

If you want to use SubX together with React, please check [react-subx](https://github.com/tylerlong/react-subx).


## Features (compared to Redux or MobX)

- Schemaless, we don't need to specify all our data fields at the beginning. We can add them gradually and dynamically.
- Intuitive, just follow common sense. No annotation or weird configurations/syntax.
- Performant, it helps us to minimize backend computation and frontend rendering.
- Developer-friendly: forget actions, reducers, dispatchers, containers...etc. We only need to know what is events stream and we are good to go.
- Based on RxJS, we can use [ALL the RxJS operators](https://www.learnrxjs.io/operators/).
- Small. 300 lines of code. (Unbelievable, huh?) We've written 5000+ lines of testing code to cover the tiny core.


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
{ type: 'SET', path: ['firstName'], val: 'Tyler', oldVal: undefined, id: 'uuid-1' }
{ type: 'SET', path: ['lastName'], val: 'Long', oldVal: undefined, id: 'uuid-2' }
```

In the sample code above, `person` is a SubX object. `person.$` is a stream of events about changes to `person`'s properties.

If you know `RxJS`, I would like to mention that `person.$` is an [Observable](http://reactivex.io/documentation/observable.html).


## What is a SubX Object / Reactive Subject?

Subject is the similar concept as the subject in [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).

A reactive subject is a special JavaScript object which allows us to subscribe to its **events**. If you are a React + Redux developer, events is similar to **actions**. If you are a Vue.js + Vuex developer, events is similar to **mutations**.

In content below, we call a reactive subject a **SubX object**.


## Types of events

Currently there are 5 basic events: `SET`, `DELETE`, `GET`, `HAS` & `KEYS`.
The corresponding event streams are `set$`, `delete$`, `get$`, `has$` & `keys$`

There are 3 advanced events: `COMPUTE_BEGIN`, `COMPUTE_FINISH` & `STALE`.
The corresponding event streams are `compute_begin$`, `compute_finish$` & `stale$`.

### $

`$` is the merge of `set$` & `delete$`. We provide it as sugar since it is mostly used.

### SET

Most of the event mentioned in this page are `SET` events. `SET` means a property has been assigned to. Such as `person.firstName = 'John'`.

```js
const person = SubX.create({ firstName: 'Tyler' })
person.set$.subscribe(console.log)
person.firstName = 'Peter'
```

### DELETE

`DELETE` events are triggered as well. We already see one of such event above in "Array events" section. Here is one more sample:

```js
const person = SubX.create({ firstName: '' })
person.delete$.subscribe(console.log)
delete person.firstName
```

### GET

`GET` events are triggered when we access a property

```js
const person = SubX.create({ firstName: '' })
person.get$.subscribe(console.log)
console.log(person.firstName)
```

### HAS

`GET` events are triggered when we use the `in` operator

```js
const person = SubX.create({ firstName: '' })
person.has$.subscribe(console.log)
console.log('firstName' in person)
```

### KEYS

`KEYS` events are triggered when we use `Object.keys(...)`

```js
const person = SubX.create({ firstName: '' })
person.keys$.subscribe(console.log)
console.log(Object.keys(person))
```

### COMPUTE_BEGIN, COMPUTE_FINISH & STALE

These 3 events are advanced. Most likely we don't need to know them.
They are for computed properties(which is covered below).

- `COMPUTE_BEGIN` is triggered when a computed property starts to compute.
- `COMPUTE_FINISH` is triggered when a computed property finishes computing.
- `STALE` is triggered when the computed property becomes "stale", which means a re-compute is necessary.


## Computed properties / getters

We use "convention over configuration" here: getter functions are computed properties. If we don't need it to be computed property, just don't make it a getter function.

So in SubX, "computed properties" and "getters" are synonyms. We use them interchangeably.

```js
const Person = new SubX({
    firstName: 'San',
    lastName: 'Zhang',
    get fullName () {
        return `${this.firstName} ${this.lastName}`
    }
})
const person = new Person()
expect(person.fullName).toBe('San Zhang')
```

What is the different between computed property and a normal function? Computed property caches its results, it won't re-compute until necessary.

So in the example above, we can call `person.fullName` multiple times but it will only compute once. It won't re-compute until we change either `firstName` or `lastName` and invoke `person.fullName` again.

I would recommend using as many getters as we can if our data don't change much. Because they can cache data to improve performance dramatically.

Computed properties / getters are supposed to be "pure". We should not update data in them. If we want to update data, define a normal function instead of a getter function.


## Pitfalls

### Circular data

If we create circular data structure with SubX, the behavior is undefined. Please don't do that.


## More info

Please read the [wiki](https://github.com/tylerlong/subx/wiki). We have a couple of useful pages there.

Our [test cases](https://github.com/tylerlong/subx/tree/master/test) have lots of interesting ideas too.
