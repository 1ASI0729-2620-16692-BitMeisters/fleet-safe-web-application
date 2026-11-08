import { Role } from './role.enum';

/**
 * Criteria to look up the users of the company.
 */
export interface UsersQuery {
  role: Role | null;
  isActive: boolean | null;
  page: number;
  size: number;
}

/**
 * A page of users and the total that match the criteria.
 */
export interface UsersPage<T> {
  users: T[];
  totalUsers: number;
}
