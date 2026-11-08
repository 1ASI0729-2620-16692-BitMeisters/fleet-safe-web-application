import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { ScheduleRepairAssembler } from './schedule-repair-assembler';
import { ScheduleRepairCommand } from '../domain/model/schedule-repair.command';
import { ScheduleRepairResource, ScheduleRepairResponse } from './schedule-repair-response';
import { Repair } from '../domain/model/repair.entity';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';

const scheduleRepairApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentsEndpointPath}`;

/**
 * Encapsulates repair scheduling HTTP operations.
 */
export class ScheduleRepairApiEndpoint extends ErrorHandlingEnabledBaseType {
  /**
   * Creates an instance of ScheduleRepairApiEndpoint.
   * @param http The HttpClient for making HTTP requests.
   * @param assembler The assembler for converting between commands, requests, and responses.
   */
  constructor(
    private http: HttpClient,
    private assembler: ScheduleRepairAssembler,
  ) {
    super();
  }

  /**
   * Schedules a repair for an incident.
   * @param command - Command containing repair data.
   * @returns Stream with the created repair entity.
   */
  scheduleRepair = (command: ScheduleRepairCommand): Observable<Repair> => {
    const request = this.assembler.toRequestFromCommand(command);
    const url = `${scheduleRepairApiEndpointUrl}/${command.incidentId}/repairs`;
    return this.http.post<ScheduleRepairResponse>(url, request).pipe(
      map((response) =>
        this.assembler.toEntityFromResource(this.assembler.toResourceFromResponse(response)),
      ),
      catchError(this.handleError('Failed to schedule repair')),
    );
  };
}
