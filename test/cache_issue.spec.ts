/* eslint-env jest */
import SubX from '../src/index';
import {ModelObj} from '../src/types';

describe('autoRun', () => {
  test('default', () => {
    const store = SubX.create({
      todos: [{completed: false}, {completed: false}, {completed: false}],
      get areAllDone() {
        return this.todos.every((todo: {completed: boolean}) => todo.completed);
      },
    });
    expect(store.areAllDone).toBeFalsy();
    store.todos.splice(1, 1);
    expect(store.areAllDone).toBeFalsy();
    store.todos[0].completed = true;
    expect(store.areAllDone).toBeFalsy();
    store.todos[1].completed = true;
    expect(store.areAllDone).toBeTruthy();
  });

  test('parents', () => {
    const store = SubX.create({
      todos: [{completed: false}, {completed: false}, {completed: false}],
    });
    store.todos.splice(1, 1);
    expect(Object.keys(store.todos[1].__parents__).length).toBe(1);
  });

  test('proxy directly', () => {
    const handler = {
      get: (target: ModelObj, prop: string, receiver: ModelObj) => {
        return target[prop];
      },
    };
    const store = {
      todos: [
        new Proxy({completed: false}, handler),
        new Proxy({completed: false}, handler),
        new Proxy({completed: false}, handler),
      ],
    };
    expect(store.todos.every(todo => todo.completed)).toBeFalsy();
    store.todos.splice(1, 1);
    expect(store.todos.every(todo => todo.completed)).toBeFalsy();
    store.todos[0].completed = true;
    expect(store.todos.every(todo => todo.completed)).toBeFalsy();
    store.todos[1].completed = true;
    expect(store.todos.every(todo => todo.completed)).toBeTruthy();
  });
});
