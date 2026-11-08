import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { IncidentInspection } from '../domain/model/incident-inspection.entity';
import { IncidentInspectionAssembler } from './incident-inspection-assembler';
import {
  IncidentInspectionResource,
  IncidentInspectionsResponse,
} from './incident-inspections-response';

const incidentInspectionsApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendInspectionsEndpointPath}`;

export class IncidentInspectionsApiEndpoint extends BaseApiEndpoint<
  IncidentInspection,
  IncidentInspectionResource,
  IncidentInspectionsResponse,
  IncidentInspectionAssembler
> {
  constructor(http: HttpClient) {
    super(http, incidentInspectionsApiEndpointUrl, new IncidentInspectionAssembler());
  }

  getByVehicleId(vehicleId: string): Observable<IncidentInspection[]> {
    const params = new HttpParams().set('vehicleId', vehicleId);
    return this.http
      .get<IncidentInspectionResource[]>(this.endpointUrl, { params })
      .pipe(
        map((resources) => resources.map((resource) => this.assembler.toEntityFromResource(resource))),
        catchError(this.handleError('Failed to fetch the inspections of the vehicle')),
      );
  }
}
