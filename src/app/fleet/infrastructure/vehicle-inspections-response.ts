import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Part of an inspection resource that Fleet Management needs for a vehicle's history.
 */
export interface VehicleInspectionResource extends BaseResource {
  vehicleId: string;
  driverId: string;
  status: string;
  odometer: number;
  startedAt: string;
}

export interface VehicleInspectionsResponse extends BaseResponse {
  inspections: VehicleInspectionResource[];
}
