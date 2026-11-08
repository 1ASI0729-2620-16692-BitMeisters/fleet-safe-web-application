import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface OperationalAuthorizationResource extends BaseResource {
  id: string;
  vehicleId: string;
  status: string;
  isOverride: boolean;
  overrideReason: string | null;
  authorizedAt: string;
}

export interface OperationalAuthorizationsResponse extends BaseResponse {
  operationalAuthorizations: OperationalAuthorizationResource[];
}
