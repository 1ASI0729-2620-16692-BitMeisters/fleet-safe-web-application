import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Incident } from '../domain/model/incident.entity';
import { IncidentResource, IncidentsResponse } from './incidents-response';
import { IncidentAssembler } from './incident-assembler';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReportIncidentRequest, UpdateIncidentRequest } from './incident-requests';

const incidentsApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Endpoint client for incident CRUD operations.
 */
export class IncidentsApiEndpoint extends BaseApiEndpoint<
  Incident,
  IncidentResource,
  IncidentsResponse,
  IncidentAssembler
> {
  constructor(http: HttpClient) {
    super(http, incidentsApiEndpointUrl, new IncidentAssembler());
  }

  override create(entity: Incident): Observable<Incident> {
    const request: ReportIncidentRequest =
      this.assembler.toReportRequestFromEntity(entity);

    return this.http
      .post<IncidentResource>(this.endpointUrl, request)
      .pipe(
        map((created) => this.assembler.toEntityFromResource(created)),
        catchError(this.handleError('Failed to create incident')),
      );
  }

  override update(entity: Incident, id: string): Observable<Incident> {
    const request: UpdateIncidentRequest =
      this.assembler.toUpdateRequestFromEntity(entity, id);

    return this.http
      .put<IncidentResource>(`${this.endpointUrl}/${id}`, request)
      .pipe(
        map((updated) => this.assembler.toEntityFromResource(updated)),
        catchError(this.handleError('Failed to update incident')),
      );
  }
}
