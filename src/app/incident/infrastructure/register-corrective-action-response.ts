import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the register corrective action endpoint.
 */
export interface RegisterCorrectiveActionResource extends BaseResource {
  id: string;
  incidentId: string;
  description: string;
  performedBy: string;
  performedAt: string;
  evidenceUrl: string | null;
}

/**
 * Response shape returned by the register corrective action endpoint.
 */
export interface RegisterCorrectiveActionResponse
  extends BaseResponse, RegisterCorrectiveActionResource {}
