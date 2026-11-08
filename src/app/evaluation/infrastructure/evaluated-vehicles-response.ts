import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface EvaluatedVehicleResource extends BaseResource {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

export interface EvaluatedVehiclesResponse extends BaseResponse {
  vehicles: EvaluatedVehicleResource[];
}
