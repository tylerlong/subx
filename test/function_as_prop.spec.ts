/* eslint-env jest */
import uuid from '../src/uuid';

import SubX from '../src/index';

describe('function as prop', () => {
  test('uuid', () => {
    const Person = SubX.model({
      firstName: '',
      lastName: '',
    });
    const person1 = Person.create({
      id: uuid(),
      firstName: 'San',
      lastName: 'Zhang',
    });
    const person2 = Person.create({
      id: uuid(),
      firstName: 'Si',
      lastName: 'Li',
    });
    expect(person1.firstName).toBe('San');
    expect(person2.lastName).toBe('Li');

    expect(typeof person1.id).toBe('number');
    expect(typeof person2.id).toBe('number');
    expect(person1.id).not.toEqual(person2.id);
  });
});
