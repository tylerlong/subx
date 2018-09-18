# SubX

Subject X, Reactive Subject

Pronunciation: [Subject X]

SubX is powered by [RxJS](https://github.com/ReactiveX/rxjs). So it's better to have some RxJS knowledge.


## What is Reactive Subject?

Subject is the similar concept as the subject in [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern).

A reactive subject is a special JavaScript object which allows you to subscribe to its **events**. If you are a React + Redux developer, events is similar to **actions**. If you are a Vue.js + Vuex developer, events is similar to **mutations**.

The wonderful thing of SubX is: you don't need to manually create events/actions/mutations, this library generates them for you automatically! We will see how it works below.


## Installation

```
yarn add subx
```

```js
import SubX from 'subx'
```


## Sample

```js
const person = SubX.create({
    firstName: 'San',
    lastName: 'Zhang'
})
person.$.subscribe(event => {
    console.log(event)
})
person.firstName = 'Si'
person.lastName = 'Li'
person.lastName = 'Wang'
person.firstName = 'Wu'
```

In the sample code above, `person` is an reactive subject.

`person.$` is a stream of events.

We can subscribe to them by `person.$.subscribe(...)`.

### Console output

```
Property changed { type: 'SET', prop: 'firstName', val: 'Si', oldVal: 'San' }
Property changed { type: 'SET', prop: 'lastName', val: 'Li', oldVal: 'Zhang' }
Property changed { type: 'SET', prop: 'lastName', val: 'Wang', oldVal: 'Li' }
Property changed { type: 'SET', prop: 'firstName', val: 'Wu', oldVal: 'Si' }
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



### Console output

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

### Console output

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

### Console output

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
