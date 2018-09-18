# SubX

Subject X, Reactive Subject. Pronunciation: [Sub X]

SubX is powered by [RxJS](https://github.com/ReactiveX/rxjs). So it's better to have some RxJS knowledge.
It's OK if you don't know RxJS, it doesn't prevent you from using this library.


## Installation

```
yarn add subx
```

```js
import SubX from 'subx'
```


## Quickstart sample

```js
const person = SubX.create({})
person.$.subscribe(console.log)
person.firstName = 'Tyler'
person.lastName = 'Long'
```

#### Console output

```
{ type: 'SET', prop: 'firstName', val: 'Tyler', oldVal: undefined }
{ type: 'SET', prop: 'lastName', val: 'Long', oldVal: undefined }
```

In the sample code above, `person` is a SubX object. `person.$` is a stream of events which you can subscribe to.


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
{ type: 'SET', prop: 'firstName', val: 'Tyler', oldVal: '' }
{ type: 'SET', prop: 'firstName', val: 'David', oldVal: 'Peter' }
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
{ type: 'SET', prop: 'prop2', val: 2, oldVal: undefined }
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
{ type: 'SET', prop: 'x', val: 0, oldVal: undefined }
{ type: 'SET', prop: 'y', val: 0, oldVal: undefined }
{ type: 'SET', prop: 'width', val: 200, oldVal: undefined }
{ type: 'SET', prop: 'height', val: 100, oldVal: undefined }
```


## track children properties' events

```js
const rectangle = SubX.create({ position: { }, size: { } })
```

Given the SubX object above, what if we want a **single** stream to track the events from BOTH `postion` and `size`?

Let's try this first:

```js
rectangle.$.subscribe(console.log)
rectangle.position.x = 0
rectangle.position.y = 0
rectangle.size.width = 200
rectangle.size.height = 100
```

#### Console output

```
```

It does **NOT** work, as you can see the console outputs nothing. This is because `rectangle.$` only provides events for `rectangle`'s **direct** properties.

Take `rectangle.position.x = 0` for example, we changed `x`, which is a direct property of `rectangle.postion`.
`rectangle.postion.$` can track this event while `rectangle.$` cannot.


### Merge event streams

One solution is to merge event streams:

```js
import { merge } from 'rxjs'

const mergeStream$ = merge(rectangle.position.$, rectangle.size.$)
mergeStream$.subscribe(console.log)
rectangle.position.x = 0
rectangle.position.y = 0
rectangle.size.width = 200
rectangle.size.height = 100
```

#### Console output

```
{ type: 'SET', prop: 'x', val: 0, oldVal: undefined }
{ type: 'SET', prop: 'y', val: 0, oldVal: undefined }
{ type: 'SET', prop: 'width', val: 200, oldVal: undefined }
{ type: 'SET', prop: 'height', val: 100, oldVal: undefined }
```

Solution above works, but there is a better way: `$$`


### $$

`obj.$$` tracks all the events inside `obj`, be them its own events or its children's events.
Children could be direct children or indirect children (children's children).

```js
const rectangle = SubX.create({ position: { }, size: { } })
rectangle.$$.subscribe(console.log)
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

Since the changes could be either to its own properties or its children's properties,
the events include a `path` property to tell you which property triggers the event.

So

```
{ type: 'SET',
    val: 100,
    oldVal: undefined,
    path: [ 'size', 'height' ] }
```

tells us that `rectangle.size.height` changed from `undefined` to `100`.

Since nested objects are also SubX objects, they support `$$` too.
For example you can `rectangle.size.$$.subscribe(...)` to track rectangle.size and its children's events.


## Events with timestamp

Want events with timestamp? RxJS provides us with [such an operator](https://rxjs-dev.firebaseapp.com/api/operators/timestamp).

```js
import { timestamp } from 'rxjs/operators'

const rectangle = SubX.create({ position: { } })
rectangle.$$.pipe(timestamp()).subscribe(console.log)
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
const rectangle = SubX.create({ position: { } })
rectangle.$$.pipe(
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



## Filter events

SubX is powered by [RxJS](https://github.com/ReactiveX/rxjs), so you can filter it just like filtering any RxJS event streams(Observables).

```js
import { filter, map } from 'rxjs/operators'

const person = SubX.create({
    firstName: 'San',
    lastName: 'Zhang'
})
const firstName$ = person.$.pipe(
    filter(event => event.prop === 'firstName')
    map(event => event.val)
)
firstName$.subscribe(val => {
    console.log('First name changed to', val)
})
person.firstName = 'Si'
person.firstName = 'Wu'
```

We call variables end with `$` streams. So `firstName$` is a stream of first names.



#### Console output

```
First name changed to Si
First name changed to Wu
```


## Computed properties

```js
const Person = SubX({
    firstName: 'San',
    lastName: 'Zhang'
}).computed({
    fullName () { // Check sample code below if you want to use arrow function instead
        console.log('fullName computed property')
        return `${this.firstName} ${this.lastName}`
    }
})
const person = new Person()
expect(person.fullName()).toBe('San Zhang')

person.firstName = 'Si'
person.lastName = 'Li'
expect(person.fullName()).toBe('Si Li')

person.lastName = 'Wang'
person.firstName = 'Wu'
expect(person.fullName()).toBe('Wu Wang')
```

#### Console output

```
fullName computed property
fullName computed property
fullName computed property
```

### Use arrow function for computed properties

If you want to use arrow function instead, use `self` instead of `this`:

```js
const Person = SubX({
    firstName: 'San',
    lastName: 'Zhang'
}).computed(self => ({
    fullName: () => `${self.firstName} ${self.lastName}`
}))
```


## Expensive computed property

Sometimes it is expensive to compute a property. We would like to avoid doing the computation too often.

Let's assume that `person.fullName()` is an expensive computation. And we definitely don't want to execute it again and again in a short peroid of time.

Intead, we only need the last `fullName` value when `firstName` and `lastName` stop changing for a while.

```js
import { merge, debounceTime } from 'rxjs/operators'
import delay from 'timeout-as-promise'

let count = 0
let fullName
const Person = SubX({
    firstName: 'San',
    lastName: 'Zhang'
}).computed({
    fullName () {
        count += 1
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
    }
})
const person = new Person()

merge(person.firstName$, person.lastName$).pipe(
    debounceTime(100),
    map(val => person.fullName())
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

In this case we think `fullName` is determined by `firstName` and `lastName` so we use

```js
merge(person.firstName$, person.lastName$)
```

We use `debounceTime(100)` so that the expensive operation will not execute until `firstName` & `lastName` have stopped changing for 100 milliseconds.

#### Console output

```
expensive computation
Full name changed Wu Wang
```

You can see that `expensive computation` was only printed once although we changed `firstName` & `lastName` four times in total.


## Todo

- Track changes to array property
    - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    - https://stackoverflow.com/questions/5100376/how-to-watch-for-array-changes
- Track changes to nested subject (property itself is a subject)
- Get some inspiration from rxdb
    - https://pubkey.github.io/rxdb/rx-schema.html
- $$ = $.pipe(map(...))
