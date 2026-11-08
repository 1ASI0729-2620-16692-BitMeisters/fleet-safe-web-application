import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { CompleteRepairAssembler } from './complete-repair-assembler';
import { CompleteRepairCommand } from '../domain/model/complete-repair.command';
import { CompleteRepairResource, CompleteRepairResponse } from './complete-repair-response';
import { Repair } from '../domain/model/repair.entity';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';

const completeRepairApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Encapsulates repair completion HTTP operations.
 */
export class CompleteRepairApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of CompleteRepairApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(
    private http: HttpClient,
    private assembler: CompleteRepairAssembler,
  ) {
    super();
  }

  /**
   * Completes a repair for an incident.
   * @param command - Command containing repair completion data.
   * @returns Stream with the updated repair entity.
   */
  completeRepair = (command: CompleteRepairCommand): Observable<Repair> => {
    const request = this.assembler.toRequestFromCommand(command);
    const url = `${completeRepairApiEndpointUrl}/${command.incidentId}/repairs/${command.repairId}/complete`;
    return this.http.patch<CompleteRepairResponse>(url, request).pipe(
      map((response) =>
        this.assembler.toEntityFromResource(this.assembler.toResourceFromResponse(response)),
      ),
      catchError(this.handleError('Failed to complete repair')),
    );
  };
}
