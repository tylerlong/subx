# SubX

Reactive Subject


## What is a reactive subject?

A reactive subject is a JavaScript class which could be used to generate reactive objects.

A reactive object is a special JavaScript object which allows you to subscribe to its mutations.


## Installation

```
yarn add subx
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

In the sample code above, person is an object with two properties: `firstName` and `lastName`.

We can subscribe to their mutations by `person.firstName$.subscribe` and `person.lastName$.subscribe`.

### Console output

```
First name changed { prop: 'firstName', val: 'Si', oldVal: 'San' }
Last name changed { prop: 'lastName', val: 'Li', oldVal: 'Zhang' }
Last name changed { prop: 'lastName', val: 'Wang', oldVal: 'Li' }
First name changed { prop: 'firstName', val: 'Wu', oldVal: 'Si' }
```

## Subscribe to all properties in one go

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
