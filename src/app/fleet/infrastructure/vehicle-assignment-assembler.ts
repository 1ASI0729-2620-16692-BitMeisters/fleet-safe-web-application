import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { VehicleAssignment } from '../domain/model/vehicle-assignment.entity';
import {
  VehicleAssignmentResource,
  VehicleAssignmentsResponse,
} from './vehicle-assignments-response';

export class VehicleAssignmentAssembler implements BaseAssembler<
  VehicleAssignment,
  VehicleAssignmentResource,
  VehicleAssignmentsResponse
> {
  toEntityFromResource(resource: VehicleAssignmentResource): VehicleAssignment {
    return new VehicleAssignment(resource);
  }

  toResourceFromEntity(entity: VehicleAssignment): VehicleAssignmentResource {
    return {
      id: entity.id,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      assignedFrom: entity.assignedFrom,
      assignedTo: entity.assignedTo,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }

  toEntitiesFromResponse(response: VehicleAssignmentsResponse): VehicleAssignment[] {
    return response.vehicleAssignments.map((resource) => this.toEntityFromResource(resource));
  }
}
