import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Incident } from '../domain/model/incident.entity';
import { IncidentResource, IncidentsResponse } from './incidents-response';
import { IncidentAssembler } from './incident-assembler';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  /**
   * Creates an instance of IncidentsApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, incidentsApiEndpointUrl, new IncidentAssembler());
  }

  override update(entity: Incident, id: string): Observable<Incident> {
    return this.http
      .put<IncidentResource>(`${this.endpointUrl}/${id}`, { ...this.assembler.toResourceFromEntity(entity), incidentId: id })
      .pipe(
        map((updated) => this.assembler.toEntityFromResource(updated)),
        catchError(this.handleError('Failed to update entity')),
      );
  }
}
