import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { VehicleInspectionSummary } from '../domain/model/vehicle-inspection-summary.entity';
import {
  VehicleInspectionResource,
  VehicleInspectionsResponse,
} from './vehicle-inspections-response';

export class VehicleInspectionSummaryAssembler implements BaseAssembler<
  VehicleInspectionSummary,
  VehicleInspectionResource,
  VehicleInspectionsResponse
> {
  toEntityFromResource(resource: VehicleInspectionResource): VehicleInspectionSummary {
    return new VehicleInspectionSummary({
      id: resource.id,
      vehicleId: resource.vehicleId,
      driverId: resource.driverId,
      status: resource.status,
      odometer: resource.odometer,
      startedAt: resource.startedAt,
    });
  }

  toResourceFromEntity(entity: VehicleInspectionSummary): VehicleInspectionResource {
    return {
      id: entity.id,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      status: entity.status,
      odometer: entity.odometer,
      startedAt: entity.startedAt,
    };
  }

  toEntitiesFromResponse(response: VehicleInspectionsResponse): VehicleInspectionSummary[] {
    return response.inspections.map((resource) => this.toEntityFromResource(resource));
  }
}
