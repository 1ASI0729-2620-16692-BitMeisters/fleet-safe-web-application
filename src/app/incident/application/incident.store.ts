import { computed, inject, Injectable, signal } from '@angular/core';
import { retry } from 'rxjs';
import { IncidentApi } from '../infrastructure/incident-api';
import { Incident } from '../domain/model/incident.entity';
import { IncidentType } from '../domain/model/incident-type.entity';
import { IncidentStatus } from '../domain/model/incident-status.enum';
import { RegisterCorrectiveActionCommand } from '../domain/model/register-corrective-action.command';
import { ScheduleRepairCommand } from '../domain/model/schedule-repair.command';
import { CompleteRepairCommand } from '../domain/model/complete-repair.command';
import { AddIncidentFollowUpCommand } from '../domain/model/add-incident-follow-up.command';
import { ResolveIncidentCommand } from '../domain/model/resolve-incident.command';
import { IncidentVehicle } from '../domain/model/incident-vehicle.entity';
import { IncidentInspection } from '../domain/model/incident-inspection.entity';

/**
 * Holds incident application state and coordinates incident management behavior.
 */
@Injectable({ providedIn: 'root' })
export class IncidentStore {
  private readonly incidentApi = inject(IncidentApi);

  private readonly incidentsSignal = signal<Incident[]>([]);
  private readonly incidentTypesSignal = signal<IncidentType[]>([]);
  private readonly vehiclesSignal = signal<IncidentVehicle[]>([]);
  private readonly inspectionsOfVehicleSignal = signal<IncidentInspection[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  /**
   * Readonly signal for the list of incidents.
   */
  readonly incidents = this.incidentsSignal.asReadonly();

  /**
   * Readonly signal for the list of incident types.
   */
  readonly incidentTypes = this.incidentTypesSignal.asReadonly();

  /**
   * Readonly signal indicating if data is loading.
   */
  readonly loading = this.loadingSignal.asReadonly();

  readonly vehicles = this.vehiclesSignal.asReadonly();

  readonly inspectionsOfVehicle = this.inspectionsOfVehicleSignal.asReadonly();

  /**
   * Readonly signal for the current error message.
   */
  readonly error = this.errorSignal.asReadonly();

  /**
   * Computed signal for the count of incidents.
   */
  readonly incidentCount = computed(() => this.incidents().length);

  /**
   * Computed signal for open incidents.
   */
  readonly openIncidents = computed(() =>
    this.incidents().filter((i) => i.status === IncidentStatus.REGISTERED),
  );

  /**
   * Computed signal for critical incidents.
   */
  readonly criticalIncidents = computed(() => this.incidents().filter((i) => i.isCritical()));

  /**
   * Creates an instance of IncidentStore and loads initial data.
   */
  constructor() {
    this.loadIncidents();
    this.loadIncidentTypes();
    this.loadVehicles();
  }

  plateOf = (vehicleId: string): string =>
    this.vehicles().find((vehicle) => vehicle.id === vehicleId)?.plate ?? vehicleId;

  loadVehicles = (): void => {
    this.incidentApi
      .getVehicles()
      .pipe(retry(2))
      .subscribe({
        next: (vehicles) => this.vehiclesSignal.set(vehicles),
        error: (err) => this.errorSignal.set(this.formatError(err, 'Failed to load vehicles')),
      });
  };

  loadInspectionsOfVehicle = (vehicleId: string): void => {
    this.inspectionsOfVehicleSignal.set([]);
    if (!vehicleId) return;
    this.incidentApi
      .getInspectionsOfVehicle(vehicleId)
      .pipe(retry(2))
      .subscribe({
        next: (inspections) => this.inspectionsOfVehicleSignal.set(inspections),
        error: (err) => this.errorSignal.set(this.formatError(err, 'Failed to load inspections')),
      });
  };

  private reloadIncident = (id: string): void => {
    this.incidentApi.getIncident(id).subscribe({
      next: (incident) => {
        this.incidentsSignal.update((incidents) =>
          incidents.map((i) => (i.id === incident.id ? incident : i)),
        );
        this.loadingSignal.set(false);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to reload incident'));
        this.loadingSignal.set(false);
      },
    });
  };

  /**
   * Selects an incident by identifier.
   * @param id - Incident identifier.
   * @returns Reactive selection for the requested incident.
   */
  getIncidentById = (id: string) =>
    computed(() => (id ? this.incidents().find((i) => i.id === id) : undefined));

  /**
   * Selects an incident type by identifier.
   * @param id - Incident type identifier.
   * @returns Reactive selection for the requested incident type.
   */
  getIncidentTypeById = (id: string) =>
    computed(() => (id ? this.incidentTypes().find((t) => t.id === id) : undefined));

  /**
   * Loads all incidents from the API.
   */
  loadIncidents = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .getIncidents()
      .pipe(retry(2))
      .subscribe({
        next: (incidents) => {
          this.incidentsSignal.set(incidents);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load incidents'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Loads all incident types from the API.
   */
  loadIncidentTypes = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .getIncidentTypes()
      .pipe(retry(2))
      .subscribe({
        next: (types) => {
          this.incidentTypesSignal.set(types);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load incident types'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Adds a new incident.
   * @param incident - The incident to add.
   */
  addIncident = (incident: Incident): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .createIncident(incident)
      .pipe(retry(2))
      .subscribe({
        next: (created) => {
          this.incidentsSignal.update((incidents) => [...incidents, created]);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to create incident'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Updates an existing incident.
   * @param incident - The incident to update.
   */
  updateIncident = (incident: Incident): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .updateIncident(incident)
      .pipe(retry(2))
      .subscribe({
        next: (updated) => {
          this.incidentsSignal.update((incidents) =>
            incidents.map((i) => (i.id === updated.id ? updated : i)),
          );
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to update incident'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Deletes an incident by ID.
   * @param id - The ID of the incident to delete.
   */
  deleteIncident = (id: string): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .deleteIncident(id)
      .pipe(retry(2))
      .subscribe({
        next: () => {
          this.incidentsSignal.update((incidents) => incidents.filter((i) => i.id !== id));
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to delete incident'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Registers a corrective action for an incident.
   * @param command - Corrective action command.
   */
  registerCorrectiveAction = (command: RegisterCorrectiveActionCommand): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .registerCorrectiveAction(command)
      .pipe(retry(2))
      .subscribe({
        next: (action) => this.reloadIncident(action.incidentId),
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to register corrective action'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Schedules a repair for an incident.
   * @param command - Schedule repair command.
   */
  scheduleRepair = (command: ScheduleRepairCommand): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .scheduleRepair(command)
      .pipe(retry(2))
      .subscribe({
        next: (repair) => this.reloadIncident(repair.incidentId),
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to schedule repair'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Completes a repair for an incident.
   * @param command - Complete repair command.
   */
  completeRepair = (command: CompleteRepairCommand): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .completeRepair(command)
      .pipe(retry(2))
      .subscribe({
        next: (updatedRepair) => this.reloadIncident(updatedRepair.incidentId),
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to complete repair'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Adds a follow-up note to an incident.
   * @param command - Add incident follow-up command.
   */
  addIncidentFollowUp = (command: AddIncidentFollowUpCommand): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .addIncidentFollowUp(command)
      .pipe(retry(2))
      .subscribe({
        next: (followUp) => this.reloadIncident(followUp.incidentId),
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to add incident follow-up'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Resolves an incident.
   * @param command - Resolve incident command.
   */
  resolveIncident = (command: ResolveIncidentCommand): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.incidentApi
      .resolveIncident(command)
      .pipe(retry(2))
      .subscribe({
        next: (updated) => {
          this.incidentsSignal.update((incidents) =>
            incidents.map((i) => (i.id === updated.id ? updated : i)),
          );
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to resolve incident'));
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Normalizes unknown errors into a display-friendly message.
   * @param error - Source error.
   * @param fallback - Default message when details are unavailable.
   * @returns Normalized message.
   */
  private formatError = (error: unknown, _fallback: string): string => {
    if (error instanceof Error && error.message.includes('Resource not found')) {
      return 'incident.error.notFound';
    }
    return 'incident.error.loadFailed';
  };
}
