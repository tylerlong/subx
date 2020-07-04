/* eslint-env jest */
import SubX from '../src/index';
import {SubxObj} from '../src/types';

describe('TS generic', () => {
  test('default', () => {
    const store = SubX.proxy({
      todos: [
        {
          title: '111',
          completed: false,
        },
        {
          title: '222',
          completed: true,
        },
        {
          title: '333',
          completed: false,
        },
      ],
      clearCompleted() {
        this.todos = this.todos.filter(
          (todo: {completed: boolean}) => !todo.completed
        );
      },
    });
    let notified = false;
    const todos = store.todos;
    ((store as unknown) as SubxObj).$.subscribe(() => {
      notified = true;
    });
    ((store as unknown) as SubxObj).transaction$.subscribe(() => {
      notified = true;
    }); // array push is transaction
    expect(notified).toBeFalsy();
    todos.push({title: '444', completed: false});
    expect(notified).toBeTruthy();

    store.clearCompleted(); // todos are no longer tracked by store
    notified = false;
    expect(notified).toBeFalsy();
    todos.push({title: '555', completed: false});
    expect(notified).toBeFalsy(); // not notified
    notified = false;
  });
});
