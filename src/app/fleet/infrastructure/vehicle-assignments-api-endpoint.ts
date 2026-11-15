import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { VehicleAssignment } from '../domain/model/vehicle-assignment.entity';
import { AssignVehicleCommand } from '../domain/model/assign-vehicle.command';
import {
  VehicleAssignmentResource,
  VehicleAssignmentsResponse,
} from './vehicle-assignments-response';
import { VehicleAssignmentAssembler } from './vehicle-assignment-assembler';
import { failWith } from './fleet-request-error';

export class VehicleAssignmentsApiEndpoint extends BaseApiEndpoint<
  VehicleAssignment,
  VehicleAssignmentResource,
  VehicleAssignmentsResponse,
  VehicleAssignmentAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.backendApiBaseUrl}${environment.backendVehicleAssignmentsEndpointPath}`,
      new VehicleAssignmentAssembler(),
    );
  }

  /**
   * Hands a vehicle to a driver. The backend assigns the identifier and the start day.
   */
  assign(command: AssignVehicleCommand): Observable<VehicleAssignment> {
    return this.http
      .post<VehicleAssignmentResource>(this.endpointUrl, {
        vehicleId: command.vehicleId,
        driverId: command.driverId,
      })
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(failWith('Failed to assign vehicle')),
      );
  }

  /**
   * Closes an active assignment today. It stays in the history.
   */
  close(assignmentId: string): Observable<VehicleAssignment> {
    return this.http
      .post<VehicleAssignmentResource>(`${this.endpointUrl}/${assignmentId}/close`, {})
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(failWith('Failed to close assignment')),
      );
  }
}
