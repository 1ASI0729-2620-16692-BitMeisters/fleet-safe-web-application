import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource describing a user returned by IAM endpoints.
 */
export interface UserResource extends BaseResource {
  id: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Page metadata returned with a page of users.
 */
export interface PageMetadataResource {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Response returned by the users collection endpoint.
 */
export interface UsersResponse extends BaseResponse {
  content: UserResource[];
  page: PageMetadataResource;
}
