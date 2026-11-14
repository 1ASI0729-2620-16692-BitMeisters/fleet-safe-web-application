import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the add incident follow-up endpoint.
 */
export interface AddIncidentFollowUpResource extends BaseResource {
  id: string;
  incidentId: string;
  note: string;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
}

/**
 * Response shape returned by the add incident follow-up endpoint.
 */
export interface AddIncidentFollowUpResponse extends BaseResponse, AddIncidentFollowUpResource {}
