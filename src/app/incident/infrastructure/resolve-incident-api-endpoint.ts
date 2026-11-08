import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { ResolveIncidentAssembler } from './resolve-incident-assembler';
import { ResolveIncidentCommand } from '../domain/model/resolve-incident.command';
import { ResolveIncidentResource, ResolveIncidentResponse } from './resolve-incident-response';
import { Incident } from '../domain/model/incident.entity';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';

const resolveIncidentApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Encapsulates incident resolution HTTP operations.
 */
export class ResolveIncidentApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of ResolveIncidentApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(
    private http: HttpClient,
    private assembler: ResolveIncidentAssembler,
  ) {
    super();
  }

  /**
   * Resolves an incident.
   * @param command - Command containing resolution data.
   * @returns Stream with the updated incident entity.
   */
  resolveIncident = (command: ResolveIncidentCommand): Observable<Incident> => {
    const request = this.assembler.toRequestFromCommand(command);
    const url = `${resolveIncidentApiEndpointUrl}/${command.incidentId}/resolve`;
    return this.http.patch<ResolveIncidentResponse>(url, request).pipe(
      map((response) =>
        this.assembler.toEntityFromResource(this.assembler.toResourceFromResponse(response)),
      ),
      catchError(this.handleError('Failed to resolve incident')),
    );
  };
}
