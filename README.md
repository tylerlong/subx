# SubX

[![Build Status](https://travis-ci.org/tylerlong/subx.svg?branch=master)](https://travis-ci.org/tylerlong/subx)
[![npm version](https://badge.fury.io/js/subx.svg)](https://badge.fury.io/js/subx)

Subject X, Reactive Subject. Pronunciation: [Sub X]

You can use SubX as a state container library like Redux & MobX.

SubX is powered by [RxJS](https://github.com/ReactiveX/rxjs). It's better to have some RxJS knowledge.
It's OK if you don't know RxJS, it doesn't prevent you from using this library.

If you want to use SubX together with React, please check [react-subx](https://github.com/tylerlong/react-subx).


## Features (compared to Redux or MobX)

- Schemaless, you don't need specify all you data fields at the beginning. You can add them gradually and dynamically.
- Intuitive, just follow common sense
- Super easy to use: forget actions, reducers, dispatchers, containers...etc.
- Based on RxJS, you can use all the RxJS operators
- No annotation or weird configurations/syntax
- Very few new concepts/terminology: you only need to know what is events stream and you are good to go.
- Able to monitor dynamic and nested data structure
- Allow you to focus on dynamic data stream instead of static data
- Small. fewer than 300 lines of code. (Unbelievable, huh?)


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
{ type: 'SET', path: ['firstName'], val: 'Tyler', oldVal: undefined }
{ type: 'SET', path: ['lastName'], val: 'Long', oldVal: undefined }
```

In the sample code above, `person` is a SubX object. `person.$` is a stream of events about changes to `person`'s properties.


## What is Reactive Subject?

Subject is the similar concept as the subject in [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).

A reactive subject is a special JavaScript object which allows you to subscribe to its **events**. If you are a React + Redux developer, events is similar to **actions**. If you are a Vue.js + Vuex developer, events is similar to **mutations**.

In content below, we call a reactive subject a **SubX object**.


## OOP-Style sample

If you are a big fan of OOP, here is another sample for you:

```js
const Person = new SubX({ firstName: '' })

const person1 = new Person()
person1.$.subscribe(console.log)
person1.firstName = 'Tyler'

const person2 = new Person({ firstName: 'Peter' })
person2.$.subscribe(console.log)
person2.firstName = 'David'
```

So you can create a `Person` class first, then create as many persons (such as `person1` & `person2`) as you want using this class.

#### Console output

```
{ type: 'SET', path: ['firstName'], val: 'Tyler', oldVal: '' }
{ type: 'SET', path: ['firstName'], val: 'David', oldVal: 'Peter' }
```


## Dynamic properties

You might have already noticed that you can dynamically add properties to a SubX object.
And newly added properties are also reactive:

```js
const s = SubX.create({ prop1: 1 })
s.$.subscribe(console.log)
s.prop2 = 2
```

#### Console output

```
{ type: 'SET', path: ['prop2'], val: 2, oldVal: undefined }
```

In the sample above, `prop2` is dynamically added property and we got its events.


## Nested objects

It's very common to have nested objects. And this library handles them pretty well.
All nested objects in a SubX object are also SubX objects.

```js
const rectangle = SubX.create({ position: { }, size: { } })
rectangle.position.$.subscribe(console.log)
rectangle.size.$.subscribe(console.log)
rectangle.position.x = 0
rectangle.position.y = 0
rectangle.size.width = 200
rectangle.size.height = 100
```

In the sample above, `rectangle` is a SubX object. It has two nested objects: `position`and `size`.
As I said before, nested objects inside a SubX object are also SubX objects. So `position`and `size` are SubX objects.
That's why you can subscribe two theirs events.

#### Console output

```
{ type: 'SET', path: ['x'], val: 0, oldVal: undefined }
{ type: 'SET', path: ['y'], val: 0, oldVal: undefined }
{ type: 'SET', path: ['width'], val: 200, oldVal: undefined }
{ type: 'SET', path: ['height'], val: 100, oldVal: undefined }
```


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

`GET` events are triggered when you access a property

```js
const person = SubX.create({ firstName: '' })
person.get$.subscribe(console.log)
console.log(person.firstName)
```

### HAS

`GET` events are triggered when you use the `in` operator

```js
const person = SubX.create({ firstName: '' })
person.has$.subscribe(console.log)
console.log('firstName' in person)
```

### KEYS

`KEYS` events are triggered when you use `Object.keys(...)`

```js
const person = SubX.create({ firstName: '' })
person.keys$.subscribe(console.log)
console.log(Object.keys(person))
```

### COMPUTE_BEGIN, COMPUTE_FINISH & STALE

These 3 events are advanced. Most likely you don't need to know them.
They are for computed properties(which is covered below).

- `COMPUTE_BEGIN` is triggered when a computed property starts to compute.
- `COMPUTE_FINISH` is triggered when a computed property finishes computing.
- `STALE` is triggered when the computed property becomes "stale", which means a re-compute is necessary.


## Filter events

Let's say you only interested in 'SET' events, you can [filter](https://rxjs-dev.firebaseapp.com/api/operators/filter) the event stream before `subscribe`:

```js
import { filter } from 'rxjs/operators'

const person = SubX.create()
person.$.pipe(
    filter(event => event.type === 'SET')
).subscribe(console.log)
```

Example above isn't useful in real project because there is already `person.set$` available. It just shows you how to filter events.

Sometimes you might only want the changes to a SubX object's direct properties (no recursive events):

```js
const person = SubX.create()
const directChangesToPerson$ = person.$.pipe(filter(event => event.path.length === 1))
```

It's a convenstion to end an event stream with `$`, that's why we name the constant `directChangesToPerson$` instead of `directChangesToPerson`.


## Recursive events

`obj.$` tracks all the events inside `obj`, be them its own events or its children's events.
Children could be direct children or indirect children (children's children).

```js
const rectangle = SubX.create({ position: { }, size: { } })
rectangle.$.subscribe(console.log)
rectangle.position.x = 0
rectangle.position.y = 0
rectangle.size.width = 200
rectangle.size.height = 100
```

#### Console output

```
{ type: 'SET',
    val: 0,
    oldVal: undefined,
    path: [ 'position', 'x' ] }

{ type: 'SET',
    val: 0,
    oldVal: undefined,
    path: [ 'position', 'y' ] }

{ type: 'SET',
    val: 200,
    oldVal: undefined,
    path: [ 'size', 'width' ] }

{ type: 'SET',
    val: 100,
    oldVal: undefined,
    path: [ 'size', 'height' ] }
```

Since nested objects are also SubX objects, they support `$` too.
For example you can `rectangle.size.$.subscribe(...)` to track `rectangle.size` and its children's events.


## Events with timestamp

Want events with timestamp? RxJS provides us with [such an operator](https://rxjs-dev.firebaseapp.com/api/operators/timestamp).

```js
import { timestamp } from 'rxjs/operators'

const rectangle = SubX.create({ position: { } })
rectangle.$.pipe(timestamp()).subscribe(console.log)
rectangle.position.x = 0
```

#### Console output

```
Timestamp {
    value:
    { type: 'SET',
        val: 0,
        oldVal: undefined,
        path: [ 'position', 'x' ] },
    timestamp: 1537247605018 }
```


### flat event with timestamp

Want a flat event with timestamp instead? While, you can [map](https://rxjs-dev.firebaseapp.com/api/operators/map) it.

```js
import { timestamp, map } from 'rxjs/operators'

const rectangle = SubX.create({ position: { } })
rectangle.$.pipe(
    timestamp(),
    map(event => ({ ...event.value, timestamp: event.timestamp }))
).subscribe(console.log)
rectangle.position.x = 0
```

#### Console output

```
{ type: 'SET',
    val: 0,
    oldVal: undefined,
    path: [ 'position', 'x' ],
    timestamp: 1537248003912 }
```


## Array events

In JavaScript, array is also object (`typeof [] === 'object'`). This library works with array as well.

```js
const list = SubX.create([1,2,3])
list.$.subscribe(console.log)
list.push(4)
list.shift()
```


#### Console output

```
{ type: 'SET', path: ['3'], val: 4, oldVal: undefined }
{ type: 'SET', path: ['length'], val: 4, oldVal: 4 }
{ type: 'SET', path: ['0'], val: 2, oldVal: 1 }
{ type: 'SET', path: ['1'], val: 3, oldVal: 2 }
{ type: 'SET', path: ['2'], val: 4, oldVal: 3 }
{ type: 'DELETE', path: ['3'], val: 4 }
{ type: 'SET', path: ['length'], val: 3, oldVal: 4 }
```

You can see that a single method call `list.shift()` could trigger multiple events.
The behavior is idential to [Proxy handler](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler).


## RxJS operators

SubX is powered by [RxJS](https://github.com/ReactiveX/rxjs). In RxJS, methods that transform or query sequences are called **operators**.

RxJS comes with "batteries included" because there are [lots of operators](https://www.learnrxjs.io/operators/). In fact, it's one of RxJS's main strengths, it's also one of SubX's main strengths, thanks to RxJS.

We've already seen some examples of operartor above, such as `timestamp`, `map` & `filter`. The more operators you manage, the more things you can do with SubX.


## Computed properties

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

We use "convention over configuration" here: getter functions are computed properties.

If you don't need it to be computed property, just don't make it a getter function.

What is the different between computed property and a normal function? Computed property caches its results, it won't re-compute until necessary.

So in the example above, you can call `person.fullName` multiple times but it will only compute once. It won't re-compute until you change either `firstName` or `lastName` and invoke `person.fullName` again.

Computed property is especially handy when you write the code in OOP-Style.
Because all the objects automatically get the computed properties from class, so you don't need to define them for each object again and again.


## To make computed property even more efficient

We know that computed property caches it result and won't re-compute until necessary.

But if relevant data changes frequently, cache doesn't help at all.

Let's assume that `person.fullName()` is an expensive computation.
And we definitely don't want to execute it again and again in a short peroid of time.

Intead, we only need the last `fullName` value when `firstName` and `lastName` stop changing for a while.

```js
import { debounceTime, map } from 'rxjs/operators'

let count = 0
let fullName
const Person = new SubX({
    firstName: 'San',
    lastName: 'Zhang',
    get fullName () {
        count += 1
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
    }
})
const person = new Person()

person.$.pipe(
    debounceTime(100),
    map(event => person.fullName)
).subscribe(val => {
    fullName = val
})

person.firstName = 'Si'
person.lastName = 'Li'

person.lastName = 'Wang'
person.firstName = 'Wu'

await delay(150)

expect(count).toBe(1) // no more than 1 time of expensive computation
expect(fullName).toBe('Wu Wang')
```

We use `debounceTime(100)` so that the expensive operation will not execute until `firstName` & `lastName` have stopped changing for 100 milliseconds.

#### Console output

```
expensive computation
```

You can see that `expensive computation` was only printed once although we changed `firstName` & `lastName` four times in total.


## Compare with MobX and Redux

### Schemaless

SubX is truely schemaless while MobX and Redux are not.

MobX requires you to specify your properties and decorate them with `@observable` so it is not schemaless.

Redux "is schemaless", but most of the time you need to keep you state "flat", otherwise you will have nightmare writing reducers. So it is not truely schemaless.


### Mutability

Redux's state is immutable. For example, `state.a = 1` is not allowed. You have to `state = { ...state, a: 1 }`.
This could become combersome when you need to achieve `state.a.b.c.d.e = 1`:

```js
state = {
    ...state,
    a: {
        ...state.a,
        b: {
            ...state.a.b
            c: {
                ...state.a.b.c,
                d: {
                    ...state.a.b.c.d
                    e: 1
                }
            }
        }
    }
}
```

Both SubX and MobX provide mutable state, so you can just update the state like you update a normal JavaScript object.


### Predictability

This is Redux's strength. Ref: https://hackernoon.com/the-fundamental-principles-behind-mobx-7a725f71f3e8
Redux, officially, does NOT support async actions. I guess it is because predictability.


### Language coverage

Per https://www.nx-framework.com/blog/public/mobx-vs-nx/

> There are a handful important JavaScript operations that MobX can not observe. These include expando (dynamically added) properties, for in loops and sparse arrays among others. Luckily ES6 has a solution to this problem.

SubX is designed to work with JSON-style data.
It supports all the data structures that JSON supports.
It also supports tracking all kinds of operations against the data structures.

Redux's state is immutable so there is no need to observe.


### Browser support

SubX is based on Proxy which cannot be polyfilled for ES5. So SubX can only run in browsers which support Proxy.

Modern browsers all support Proxy. Microsft IE doesn't support Proxy. Microsfot Edge does support Proxy.

Redux & MobX have better browser compatibility.


## Pitfalls

- **Circular data**. If you create circular data structure with SubX, the behavior is undefined.


## Todo

- How to undo the changes according to events?
- React render method is the computed property!
    - reduce the times of react render.
    - SubX.create(this.props) ?
    - How to handle nested react components?
- As Michael found, `seal`, `freeze` & `preventExtensions`  all trigger `preventExtensions` and `defineProperty`.
    - should support defineProperty?
    - advanced feature, hold on
    - definedProperty doesn't support parameter receiver. But we can save the receiver in `handler.get` & `handler.set`
- Create a todo mvc demo
- Rename it
    - Max: 'Current X'
    - Max: actuate
- Similar concept: https://github.com/nx-js/observer-util
    - It doesn't use RxJS
