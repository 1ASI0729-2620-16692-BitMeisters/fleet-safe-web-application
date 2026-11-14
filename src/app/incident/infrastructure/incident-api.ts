import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { Incident } from '../domain/model/incident.entity';
import { IncidentType } from '../domain/model/incident-type.entity';
import { CorrectiveAction } from '../domain/model/corrective-action.entity';
import { Repair } from '../domain/model/repair.entity';
import { IncidentFollowUp } from '../domain/model/incident-follow-up.entity';
import { IncidentsApiEndpoint } from './incidents-api-endpoint';
import { IncidentTypesApiEndpoint } from './incident-types-api-endpoint';
import { IncidentVehiclesApiEndpoint } from './incident-vehicles-api-endpoint';
import { IncidentInspectionsApiEndpoint } from './incident-inspections-api-endpoint';
import { IncidentVehicle } from '../domain/model/incident-vehicle.entity';
import { IncidentInspection } from '../domain/model/incident-inspection.entity';
import { RegisterCorrectiveActionApiEndpoint } from './register-corrective-action-api-endpoint';
import { ScheduleRepairApiEndpoint } from './schedule-repair-api-endpoint';
import { CompleteRepairApiEndpoint } from './complete-repair-api-endpoint';
import { AddIncidentFollowUpApiEndpoint } from './add-incident-follow-up-api-endpoint';
import { ResolveIncidentApiEndpoint } from './resolve-incident-api-endpoint';
import { RegisterCorrectiveActionCommand } from '../domain/model/register-corrective-action.command';
import { ScheduleRepairCommand } from '../domain/model/schedule-repair.command';
import { CompleteRepairCommand } from '../domain/model/complete-repair.command';
import { AddIncidentFollowUpCommand } from '../domain/model/add-incident-follow-up.command';
import { ResolveIncidentCommand } from '../domain/model/resolve-incident.command';
import { RegisterCorrectiveActionAssembler } from './register-corrective-action-assembler';
import { ScheduleRepairAssembler } from './schedule-repair-assembler';
import { CompleteRepairAssembler } from './complete-repair-assembler';
import { AddIncidentFollowUpAssembler } from './add-incident-follow-up-assembler';
import { ResolveIncidentAssembler } from './resolve-incident-assembler';
import { UpdateIncidentStatusApiEndpoint } from './update-incident-status-api-endpoint';
import { IncidentAssembler } from './incident-assembler';

/**
 * Infrastructure facade for incident-related endpoint operations.
 */
@Injectable({ providedIn: 'root' })
export class IncidentApi extends BaseApi {
  private readonly http = inject(HttpClient);

  private readonly incidentsEndpoint = new IncidentsApiEndpoint(this.http);
  private readonly incidentTypesEndpoint = new IncidentTypesApiEndpoint(this.http);
  private readonly incidentVehiclesEndpoint = new IncidentVehiclesApiEndpoint(this.http);
  private readonly incidentInspectionsEndpoint = new IncidentInspectionsApiEndpoint(this.http);
  private readonly registerCorrectiveActionEndpoint = new RegisterCorrectiveActionApiEndpoint(
    this.http,
    new RegisterCorrectiveActionAssembler(),
  );
  private readonly scheduleRepairEndpoint = new ScheduleRepairApiEndpoint(
    this.http,
    new ScheduleRepairAssembler(),
  );
  private readonly completeRepairEndpoint = new CompleteRepairApiEndpoint(
    this.http,
    new CompleteRepairAssembler(),
  );
  private readonly addIncidentFollowUpEndpoint = new AddIncidentFollowUpApiEndpoint(
    this.http,
    new AddIncidentFollowUpAssembler(),
  );
  private readonly resolveIncidentEndpoint = new ResolveIncidentApiEndpoint(
    this.http,
    new ResolveIncidentAssembler(),
  );

  private readonly updateIncidentStatusEndpoint = new UpdateIncidentStatusApiEndpoint(
    this.http,
    new IncidentAssembler(),
  );

  getVehicles = (): Observable<IncidentVehicle[]> => this.incidentVehiclesEndpoint.getAll();

  getInspectionsOfVehicle = (vehicleId: string): Observable<IncidentInspection[]> =>
    this.incidentInspectionsEndpoint.getByVehicleId(vehicleId);

  // ── Incidents ──────────────────────────────────────────────

  /**
   * Retrieves all incidents.
   */
  getIncidents = (): Observable<Incident[]> => this.incidentsEndpoint.getAll();

  /**
   * Retrieves an incident by ID.
   */
  getIncident = (id: string): Observable<Incident> => this.incidentsEndpoint.getById(id);

  /**
   * Creates a new incident.
   */
  createIncident = (incident: Incident): Observable<Incident> =>
    this.incidentsEndpoint.create(incident);

  /**
   * Updates an existing incident.
   */
  updateIncident = (incident: Incident): Observable<Incident> =>
    this.incidentsEndpoint.update(incident, incident.id);

  /**
   * Deletes an incident by ID.
   */
  deleteIncident = (id: string): Observable<void> => this.incidentsEndpoint.delete(id);

  // ── Incident Types ─────────────────────────────────────────

  /**
   * Retrieves all incident types.
   */
  getIncidentTypes = (): Observable<IncidentType[]> => this.incidentTypesEndpoint.getAll();

  /**
   * Retrieves an incident type by ID.
   */
  getIncidentType = (id: string): Observable<IncidentType> =>
    this.incidentTypesEndpoint.getById(id);

  /**
   * Creates a new incident type.
   */
  createIncidentType = (incidentType: IncidentType): Observable<IncidentType> =>
    this.incidentTypesEndpoint.create(incidentType);

  /**
   * Updates an existing incident type.
   */
  updateIncidentType = (incidentType: IncidentType): Observable<IncidentType> =>
    this.incidentTypesEndpoint.update(incidentType, incidentType.id);

  /**
   * Deletes an incident type by ID.
   */
  deleteIncidentType = (id: string): Observable<void> => this.incidentTypesEndpoint.delete(id);

  // ── Corrective Actions ─────────────────────────────────────

  /**
   * Registers a corrective action for an incident.
   */
  registerCorrectiveAction = (
    command: RegisterCorrectiveActionCommand,
  ): Observable<CorrectiveAction> =>
    this.registerCorrectiveActionEndpoint.registerCorrectiveAction(command);

  attachCorrectiveActionEvidence = (
    incidentId: string,
    correctiveActionId: string,
    file: File,
  ): Observable<unknown> =>
    this.registerCorrectiveActionEndpoint.attachEvidence(incidentId, correctiveActionId, file);

  // ── Repairs ────────────────────────────────────────────────

  /**
   * Schedules a repair for an incident.
   */
  scheduleRepair = (command: ScheduleRepairCommand): Observable<Repair> =>
    this.scheduleRepairEndpoint.scheduleRepair(command);

  /**
   * Completes a repair for an incident.
   */
  completeRepair = (command: CompleteRepairCommand): Observable<Repair> =>
    this.completeRepairEndpoint.completeRepair(command);

  // ── Follow-ups ─────────────────────────────────────────────

  /**
   * Adds a follow-up note to an incident.
   */
  addIncidentFollowUp = (command: AddIncidentFollowUpCommand): Observable<IncidentFollowUp> =>
    this.addIncidentFollowUpEndpoint.addIncidentFollowUp(command);

  // ── Resolution ─────────────────────────────────────────────

  /**
   * Resolves an incident.
   */
  resolveIncident = (command: ResolveIncidentCommand): Observable<Incident> =>
    this.resolveIncidentEndpoint.resolveIncident(command);

  /**
   * Moves an incident to review.
   */
  updateIncidentStatus = (incidentId: string): Observable<Incident> =>
    this.updateIncidentStatusEndpoint.updateIncidentStatus(incidentId);
}
