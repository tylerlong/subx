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
import Subx from 'subx'

const MyModel = Subx({ counter: 0 })
const myObj = new MyModel()

myObj.subscribe(mutation => {
  console.log(mutation)
})

myObj.counter += 1
myObj.counter = 5
myObj.counter -= 2
myObj.counter = 8
```

Console output:

```
{ prop: 'counter', val: 1, oldVal: 0 }
{ prop: 'counter', val: 5, oldVal: 1 }
{ prop: 'counter', val: 3, oldVal: 5 }
{ prop: 'counter', val: 8, oldVal: 3 }
```
