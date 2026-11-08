import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface IncidentVehicleResource extends BaseResource {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

export interface IncidentVehiclesResponse extends BaseResponse {
  vehicles: IncidentVehicleResource[];
}
