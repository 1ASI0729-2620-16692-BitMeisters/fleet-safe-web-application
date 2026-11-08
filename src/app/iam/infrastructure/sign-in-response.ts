import { BaseResponse } from '../../shared/infrastructure/base-response';
import { UserResource } from './users-response';

/**
 * Response returned by the sign-in endpoint.
 */
export interface SignInResponse extends BaseResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResource;
}

/**
 * Session obtained from a successful sign-in.
 */
export interface SignInResource {
  token: string;
  expiresAt: number;
  user: UserResource;
}
