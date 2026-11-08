import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface IncidentInspectionResource extends BaseResource {
  id: string;
  vehicleId: string;
  status: string;
  startedAt: string;
}

export interface IncidentInspectionsResponse extends BaseResponse {
  inspections: IncidentInspectionResource[];
}
