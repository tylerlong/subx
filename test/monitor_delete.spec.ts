/* eslint-env jest */
import SubX from '../src/index';
import {TrapEvent} from '../src/types';

describe('monitor delete', () => {
  test('default', () => {
    const store = SubX.create({
      todos: [
        {
          title: '111',
          completed: false,
        },
        {
          title: '222',
          completed: false,
        },
        {
          title: '333',
          completed: false,
        },
      ],
    });
    const render = (props: {
      todo: {completed: boolean; cache: {}; title: string};
    }) => {
      const todo = props.todo;
      expect(todo.completed).toBeFalsy();
      expect(todo.cache).toBeUndefined();
      expect(todo.title).toBe('333');
    };
    const props = {store, todo: store.todos[2]};
    const {result, stream$} = SubX.runAndMonitor(SubX.create(props), () =>
      render(props)
    );
    expect(result).toBeUndefined();
    const events: TrapEvent[] = [];
    stream$.subscribe(e => events.push(e));
    store.todos.splice(2, 1);
    expect(events).toEqual([]); // delete parent path won't trigger stale
  });
});
