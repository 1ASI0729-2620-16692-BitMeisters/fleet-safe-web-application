import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Incident } from '../domain/model/incident.entity';
import { IncidentAssembler } from './incident-assembler';
import { IncidentResource } from './incidents-response';
import { UpdateIncidentStatusRequest } from './update-incident-status.request';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';

const updateIncidentStatusApiEndpointUrl =
  `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Encapsulates incident status update HTTP operations.
 */
export class UpdateIncidentStatusApiEndpoint extends ErrorHandlingEnabledBaseType {
  constructor(
    private http: HttpClient,
    private assembler: IncidentAssembler,
  ) {
    super();
  }

  updateIncidentStatus = (incidentId: string): Observable<Incident> => {
    const request: UpdateIncidentStatusRequest = {
      status: 'IN_REVIEW',
    };

    const url = `${updateIncidentStatusApiEndpointUrl}/${incidentId}`;

    return this.http.patch<IncidentResource>(url, request).pipe(
      map((response) => this.assembler.toEntityFromResource(response)),
      catchError(this.handleError('Failed to update incident status')),
    );
  };
}
