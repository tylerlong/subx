# reactive-model

Generate reactive model classes with ease.


## What is a reactive model?

First of all, what is a model? The "model" here is the same concept as the "M" in MVC pattern.

A reactive model is a JavaScript class which could be used to generate reactive objects.

A reactive object is a special JavaScript object which allows you to subscribe to its mutations.


## Installation

```
yarn add reactive-model
```


## Sample

```js
import ReactiveModel from 'reactive-model'

const MyModel = ReactiveModel({ counter: 0 })
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
