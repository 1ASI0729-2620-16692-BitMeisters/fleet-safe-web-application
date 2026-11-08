import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { AddIncidentFollowUpAssembler } from './add-incident-follow-up-assembler';
import { AddIncidentFollowUpCommand } from '../domain/model/add-incident-follow-up.command';
import {
  AddIncidentFollowUpResource,
  AddIncidentFollowUpResponse,
} from './add-incident-follow-up-response';
import { IncidentFollowUp } from '../domain/model/incident-follow-up.entity';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';

const addIncidentFollowUpApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Encapsulates incident follow-up HTTP operations.
 */
export class AddIncidentFollowUpApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of AddIncidentFollowUpApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(
    private http: HttpClient,
    private assembler: AddIncidentFollowUpAssembler,
  ) {
    super();
  }

  /**
   * Adds a follow-up note to an incident.
   * @param command - Command containing follow-up data.
   * @returns Stream with the created follow-up entity.
   */
  addIncidentFollowUp = (command: AddIncidentFollowUpCommand): Observable<IncidentFollowUp> => {
    const request = this.assembler.toRequestFromCommand(command);
    const url = `${addIncidentFollowUpApiEndpointUrl}/${command.incidentId}/follow-ups`;
    return this.http.post<AddIncidentFollowUpResponse>(url, request).pipe(
      map((response) =>
        this.assembler.toEntityFromResource(this.assembler.toResourceFromResponse(response)),
      ),
      catchError(this.handleError('Failed to add incident follow-up')),
    );
  };
}
