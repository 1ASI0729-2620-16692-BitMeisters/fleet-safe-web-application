/**
 * Fields an administrator changes on an account; the ones left out stay as they are.
 */
export interface UpdateUserRequest {
  role?: string;
  isActive?: boolean;
}
