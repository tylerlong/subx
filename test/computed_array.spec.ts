/* eslint-env jest */
import SubX from '../src/index';

describe('computed & array', () => {
  test('default', () => {
    let count = 0;
    const todoList = SubX.create({
      todos: [
        {
          name: 'do task A',
          complete: false,
        },
        {
          name: 'do task B',
          complete: false,
        },
        {
          name: 'do task C',
          complete: true,
        },
      ],
      get todoCount() {
        count += 1;
        return this.todos.filter(
          (todo: {name: string; complete: boolean}) => todo.complete === false
        ).length;
      },
    });
    expect(todoList.todoCount).toBe(2);
    expect(todoList.todoCount).toBe(2);
    expect(count).toBe(1);
    todoList.todos[1].complete = false; // didn't change its value
    expect(todoList.todoCount).toBe(2);
    expect(todoList.todoCount).toBe(2);
    expect(count).toBe(1);
    todoList.todos[1].complete = true; // changed its value
    expect(todoList.todoCount).toBe(1);
    expect(todoList.todoCount).toBe(1);
    expect(count).toBe(2);
  });
});
