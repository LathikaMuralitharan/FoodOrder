import type { User } from '../../types';

export interface MockUser extends User {
  password: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '5551234567',
    password: 'password123',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '5559876543',
    password: 'password456',
    createdAt: '2024-02-20T14:30:00Z',
  },
];
