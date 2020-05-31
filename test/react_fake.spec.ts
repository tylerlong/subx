/* eslint-env jest */
import SubX from '../src/index';

const store = SubX.create({
  todos: [],
  get leftCount() {
    return this.todos.filter((todo: {completed: boolean}) => !todo.completed)
      .length;
  },
});

let count = 0;
const render = () => {
  count += 1;
  expect(store.leftCount).toBeGreaterThanOrEqual(0);
};
const newRender = () => {
  const props = {store};
  const stream$ = SubX.runAndMonitor(SubX.create(props), render).stream$;
  const sub = stream$.subscribe(event => {
    sub.unsubscribe();
    newRender();
  });
};

describe('Fake React', () => {
  test('default', () => {
    newRender();
    expect(count).toBe(1);
    store.todos.push({title: '111', completed: false});
    expect(count).toBe(2);
    store.todos.push({title: '222', completed: false});
    expect(count).toBe(3);
  });
});
