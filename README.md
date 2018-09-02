# SubX

Subject X, Reactive Subject

Pronunciation: [Subject X]


## What is a Reactive Subject?

A Reactive Subject is a JavaScript class which could be used to initialize reactive objects.

A reactive object is a special JavaScript object which allows you to subscribe to its mutations.


## Installation

```
yarn add subx
```

```js
import SubX from 'subx'
```


## Sample

```js
const Person = SubX({
    firstName: 'San',
    lastName: 'Zhang'
})
const person = new Person()
person.firstName$.subscribe(mutation => {
    console.log('First name changed', mutation)
})
person.lastName$.subscribe(mutation => {
    console.log('Last name changed', mutation)
})
person.firstName = 'Si'
person.lastName = 'Li'
person.lastName = 'Wang'
person.firstName = 'Wu'
```

In the sample code above, `person` is an object with two properties: `firstName` and `lastName`.

We can subscribe to their mutations by `person.firstName$.subscribe` and `person.lastName$.subscribe`.

We call variables end with `$` streams. So `person.firstName$` is a stream of first names, `person.lastName$` is a stream of last names.

We use `stream$.subscribe()` method to listen to the data events in the the stream.

### Console output

```
First name changed { prop: 'firstName', val: 'Si', oldVal: 'San' }
Last name changed { prop: 'lastName', val: 'Li', oldVal: 'Zhang' }
Last name changed { prop: 'lastName', val: 'Wang', oldVal: 'Li' }
First name changed { prop: 'firstName', val: 'Wu', oldVal: 'Si' }
```


## Subscribe to all property streams in one go

```js
const Person = SubX({
    firstName: 'San',
    lastName: 'Zhang'
})
const person = new Person()
person.$.subscribe(mutation => {
    console.log('Prop changed', mutation)
})
person.firstName = 'Si'
person.lastName = 'Li'
person.lastName = 'Wang'
person.firstName = 'Wu'
```

Instead of `person.firstName$.subscribe` and `person.lastName$.subscribe`, we do `person.$.subscribe`.

### Console output

```
Prop changed { prop: 'firstName', val: 'Si', oldVal: 'San' }
Prop changed { prop: 'lastName', val: 'Li', oldVal: 'Zhang' }
Prop changed { prop: 'lastName', val: 'Wang', oldVal: 'Li' }
Prop changed { prop: 'firstName', val: 'Wu', oldVal: 'Si' }
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
    fullName: function () {
        count += 1
        console.log('expensive computation')
        return `${this.firstName} ${this.lastName}`
    }
})
const person = new Person()

person.fullName$(
    person.firstName$.pipe(
        merge(person.lastName$),
        debounceTime(1000)
    )
).subscribe(val => {
    fullName = val
})

person.firstName = 'Si'
person.lastName = 'Li'

person.lastName = 'Wang'
person.firstName = 'Wu'

await delay(1500)

expect(count).toBe(1) // no more than 1 time of expensive computation
expect(fullName).toBe('Wu Wang')
```

`person.fullName$` is a function and it accepts a stream as argument.
In this case we think `fullName` is determined by `firstName` and `lastName` so we pass

```js
person.firstName$.pipe(
    merge(person.lastName$),
    ...
```

We use `debounceTime(1000)` so that the expensive operation will not execute until `firstName` & `lastName` have stopped changing for 1 second.

### Console output

```
expensive computation
Full name changed Wu Wang
```

You can see that `expensive computation` was only printed once although we changed `firstName` & `lastName` four times in total.


## Todo

- Computed properties should allow arguments
