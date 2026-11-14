import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { RegisterCorrectiveActionAssembler } from './register-corrective-action-assembler';
import { RegisterCorrectiveActionCommand } from '../domain/model/register-corrective-action.command';
import {
  RegisterCorrectiveActionResource,
  RegisterCorrectiveActionResponse,
} from './register-corrective-action-response';
import { CorrectiveAction } from '../domain/model/corrective-action.entity';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';

const registerCorrectiveActionApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Encapsulates corrective action registration HTTP operations.
 */
export class RegisterCorrectiveActionApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of RegisterCorrectiveActionApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(
    private http: HttpClient,
    private assembler: RegisterCorrectiveActionAssembler,
  ) {
    super();
  }

  /**
   * Registers a corrective action for an incident.
   * @param command - Command containing corrective action data.
   * @returns Stream with the created corrective action entity.
   */
  registerCorrectiveAction = (
    command: RegisterCorrectiveActionCommand,
  ): Observable<CorrectiveAction> => {
    const request = this.assembler.toRequestFromCommand(command);
    const url = `${registerCorrectiveActionApiEndpointUrl}/${command.incidentId}/corrective-actions`;
    return this.http.post<RegisterCorrectiveActionResponse>(url, request).pipe(
      map((response) =>
        this.assembler.toEntityFromResource(this.assembler.toResourceFromResponse(response)),
      ),
      catchError(this.handleError('Failed to register corrective action')),
    );
  };

  attachEvidence = (
    incidentId: string,
    correctiveActionId: string,
    file: File,
  ): Observable<unknown> => {
    const form = new FormData();
    form.append('file', file);

    const params = new HttpParams().set('correctiveActionId', correctiveActionId);
    const url = `${registerCorrectiveActionApiEndpointUrl}/${incidentId}/evidences`;

    return this.http
      .post(url, form, { params })
      .pipe(catchError(this.handleError('Failed to attach the evidence')));
  };
}
