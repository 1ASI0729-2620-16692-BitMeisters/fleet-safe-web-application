import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { VehicleInspectionSummary } from '../domain/model/vehicle-inspection-summary.entity';
import { VehicleInspectionSummaryAssembler } from './vehicle-inspection-summary-assembler';
import {
  VehicleInspectionResource,
  VehicleInspectionsResponse,
} from './vehicle-inspections-response';

/**
 * Reads the inspections of the Pre-Operational Inspection context to show a vehicle's history.
 *
 * @remarks
 * Fleet Management only consumes this resource; it never writes it.
 */
export class VehicleInspectionsApiEndpoint extends BaseApiEndpoint<
  VehicleInspectionSummary,
  VehicleInspectionResource,
  VehicleInspectionsResponse,
  VehicleInspectionSummaryAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.backendApiBaseUrl}${environment.backendInspectionsEndpointPath}`,
      new VehicleInspectionSummaryAssembler(),
    );
  }

  /**
   * Gets the inspections performed on a vehicle.
   *
   * @param vehicleId - Identifier of the vehicle.
   */
  getByVehicleId(vehicleId: string): Observable<VehicleInspectionSummary[]> {
    const params = new HttpParams().set('vehicleId', vehicleId);

    return this.http
      .get<VehicleInspectionsResponse | VehicleInspectionResource[]>(this.endpointUrl, { params })
      .pipe(
        map((response) =>
          Array.isArray(response)
            ? response.map((resource) => this.assembler.toEntityFromResource(resource))
            : this.assembler.toEntitiesFromResponse(response),
        ),
        // The filter is repeated on the client so the result is right even if the server
        // ignores the query parameter.
        map((summaries) => summaries.filter((summary) => summary.vehicleId === vehicleId)),
        catchError(this.handleError('Failed to fetch the vehicle inspections')),
      );
  }
}
