import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, retry } from 'rxjs';
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
   * Computed signal for unresolved incidents.
   */
  readonly openIncidents = computed(() =>
    this.incidents().filter(
      (incident) =>
        incident.status === IncidentStatus.REGISTERED ||
        incident.status === IncidentStatus.IN_REVIEW,
    ),
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

  private reloadIncident = async (id: string): Promise<void> => {
    try {
      const incident = await firstValueFrom(this.incidentApi.getIncident(id));

      this.incidentsSignal.update((incidents) =>
        incidents.map((item) => (item.id === incident.id ? incident : item)),
      );
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'incident.error.loadFailed'));
    }
  };

  private executeWrite = async <T>(
    operation: Promise<T>,
    fallback: string,
    onSuccess: (result: T) => void | Promise<void>,
  ): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const result = await operation;
      await onSuccess(result);
      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, fallback));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
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
   */
  addIncident = (incident: Incident): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.createIncident(incident)),
      'incident.error.loadFailed',
      (created) => {
        this.incidentsSignal.update((incidents) => [...incidents, created]);
      },
    );

  /**
   * Updates an existing incident.
   */
  updateIncident = (incident: Incident): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.updateIncident(incident)),
      'incident.error.loadFailed',
      (updated) => {
        this.incidentsSignal.update((incidents) =>
          incidents.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
    );

  /**
   * Moves an incident to the IN_REVIEW status.
   */
  updateIncidentStatus = (incidentId: string): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.updateIncidentStatus(incidentId)),
      'incident.error.loadFailed',
      (updated) => {
        this.incidentsSignal.update((incidents) =>
          incidents.map((item) => (item.id === updated.id ? updated : item)),
        );
      },
    );

  /**
   * Deletes an incident by ID.
   */
  deleteIncident = (id: string): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.deleteIncident(id)),
      'incident.error.loadFailed',
      () => {
        this.incidentsSignal.update((incidents) =>
          incidents.filter((incident) => incident.id !== id),
        );
      },
    );

  /**
   * Registers a corrective action for an incident.
   */
  registerCorrectiveAction = async (
    command: RegisterCorrectiveActionCommand,
    evidence: File | null = null,
  ): Promise<boolean> => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const action = await firstValueFrom(this.incidentApi.registerCorrectiveAction(command));

      if (evidence) {
        try {
          await firstValueFrom(
            this.incidentApi.attachCorrectiveActionEvidence(action.incidentId, action.id, evidence),
          );
        } catch (error) {
          this.errorSignal.set(this.formatError(error, 'incident.error.loadFailed'));
        }
      }

      await this.reloadIncident(action.incidentId);

      return true;
    } catch (error) {
      this.errorSignal.set(this.formatError(error, 'incident.error.loadFailed'));
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  };

  /**
   * Schedules a repair for an incident.
   */
  scheduleRepair = (command: ScheduleRepairCommand): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.scheduleRepair(command)),
      'incident.error.loadFailed',
      async (repair) => {
        await this.reloadIncident(repair.incidentId);
      },
    );

  /**
   * Completes a repair for an incident.
   */
  completeRepair = (command: CompleteRepairCommand): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.completeRepair(command)),
      'incident.error.loadFailed',
      async (repair) => {
        await this.reloadIncident(repair.incidentId);
      },
    );

  /**
   * Adds a follow-up note to an incident.
   */
  addIncidentFollowUp = (command: AddIncidentFollowUpCommand): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.addIncidentFollowUp(command)),
      'incident.error.loadFailed',
      async (followUp) => {
        await this.reloadIncident(followUp.incidentId);
      },
    );

  /**
   * Resolves an incident.
   */
  resolveIncident = (command: ResolveIncidentCommand): Promise<boolean> =>
    this.executeWrite(
      firstValueFrom(this.incidentApi.resolveIncident(command)),
      'incident.error.loadFailed',
      async (updated) => {
        await this.reloadIncident(updated.id);
      },
    );

  /**
   * Normalizes unknown errors into a display-friendly message.
   * @param error - Source error.
   * @param fallback - Default message when details are unavailable.
   * @returns Normalized message.
   */
  private formatError = (error: unknown, fallback: string): string => {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('Resource not found')) {
      return 'incident.error.notFound';
    }

    return fallback;
  };
}
