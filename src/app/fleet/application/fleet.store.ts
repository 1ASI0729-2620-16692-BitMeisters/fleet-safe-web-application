import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { forkJoin, Observable, retry } from 'rxjs';

import { Notifier } from '../../shared/application/notifier';

import { FleetApi } from '../infrastructure/fleet-api';

import { AssignVehicleCommand } from '../domain/model/assign-vehicle.command';
import { Company } from '../domain/model/company.entity';
import { Driver } from '../domain/model/driver.entity';
import { EndVehicleAssignmentCommand } from '../domain/model/end-vehicle-assignment.command';
import { Fleet } from '../domain/model/fleet.entity';
import { localDate } from '../domain/model/local-date';
import { RegisterVehicleCommand } from '../domain/model/register-vehicle.command';
import { UpdateVehicleCommand } from '../domain/model/update-vehicle.command';
import { VehicleAssignment } from '../domain/model/vehicle-assignment.entity';
import { VehicleAssignmentPolicy } from '../domain/model/vehicle-assignment.policy';
import { VehicleInspectionSummary } from '../domain/model/vehicle-inspection-summary.entity';
import { VehicleStatus } from '../domain/model/vehicle-status.enum';
import { Vehicle } from '../domain/model/vehicle.entity';

/**
 * Describes a fleet together with the company that owns it and the condition of its vehicles.
 */
export interface FleetOverview {
  readonly fleet: Fleet;
  readonly company: Company | undefined;
  readonly vehicleCount: number;
  readonly enabledCount: number;
  readonly observedCount: number;
  readonly notEnabledCount: number;
}

/**
 * Holds the application state of Fleet Management and coordinates its use cases.
 *
 * @remarks
 * Errors are exposed as translation keys so views never show raw technical messages. Failures to
 * load data are published in {@link FleetStore.error}; the outcome of a user action (a rejected
 * rule or a failed save) is published in {@link FleetStore.actionError}.
 */
@Injectable({
  providedIn: 'root',
})
export class FleetStore {
  private readonly fleetApi = inject(FleetApi);
  private readonly notifier = inject(Notifier);

  private readonly companiesSignal = signal<Company[]>([]);
  readonly companies = this.companiesSignal.asReadonly();

  private readonly fleetsSignal = signal<Fleet[]>([]);
  readonly fleets = this.fleetsSignal.asReadonly();

  private readonly vehiclesSignal = signal<Vehicle[]>([]);
  readonly vehicles = this.vehiclesSignal.asReadonly();

  private readonly driversSignal = signal<Driver[]>([]);
  readonly drivers = this.driversSignal.asReadonly();

  private readonly vehicleAssignmentsSignal = signal<VehicleAssignment[]>([]);
  readonly vehicleAssignments = this.vehicleAssignmentsSignal.asReadonly();

  private readonly vehicleInspectionsSignal = signal<Record<string, VehicleInspectionSummary[]>>(
    {},
  );
  readonly vehicleInspections = this.vehicleInspectionsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly loadedSignal = signal<boolean>(false);
  readonly loaded = this.loadedSignal.asReadonly();

  private readonly savingSignal = signal<boolean>(false);
  readonly saving = this.savingSignal.asReadonly();

  private readonly inspectionsLoadingSignal = signal<boolean>(false);
  readonly inspectionsLoading = this.inspectionsLoadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  private readonly actionErrorSignal = signal<string | null>(null);
  readonly actionError = this.actionErrorSignal.asReadonly();

  private readonly inspectionsErrorSignal = signal<string | null>(null);
  readonly inspectionsError = this.inspectionsErrorSignal.asReadonly();

  readonly companiesById = computed(
    () =>
      new Map<string, Company>(this.companies().map((company) => [company.id, company] as const)),
  );

  readonly fleetsById = computed(
    () => new Map<string, Fleet>(this.fleets().map((fleet) => [fleet.id, fleet] as const)),
  );

  readonly vehiclesById = computed(
    () =>
      new Map<string, Vehicle>(this.vehicles().map((vehicle) => [vehicle.id, vehicle] as const)),
  );

  readonly driversById = computed(
    () => new Map<string, Driver>(this.drivers().map((driver) => [driver.id, driver] as const)),
  );

  readonly companyCount = computed(() => this.companies().length);

  readonly fleetCount = computed(() => this.fleets().length);

  readonly vehicleCount = computed(() => this.vehicles().length);

  readonly driverCount = computed(() => this.drivers().length);

  readonly activeAssignments = computed(() => {
    const now = new Date();
    return this.vehicleAssignments().filter((assignment) => assignment.isActiveOn(now));
  });

  readonly activeAssignmentCount = computed(() => this.activeAssignments().length);

  /**
   * Vehicles that no driver is using at the moment, whatever their operational condition.
   * Whether they may be assigned is decided by {@link VehicleAssignmentPolicy}.
   */
  readonly availableVehicles = computed(() => {
    const assignments = this.vehicleAssignments();
    const now = new Date();
    return this.vehicles().filter(
      (vehicle) => vehicle.getActiveAssignment(assignments, now) === null,
    );
  });

  /**
   * Drivers that have no vehicle at the moment, whatever the state of their license.
   * Whether they may receive a vehicle is decided by {@link VehicleAssignmentPolicy}.
   */
  readonly availableDrivers = computed(() => {
    const assignments = this.vehicleAssignments();
    const now = new Date();
    return this.drivers().filter((driver) => driver.getActiveAssignment(assignments, now) === null);
  });

  readonly vehicleStatusSummary = computed<Record<VehicleStatus, number>>(() => {
    const summary: Record<VehicleStatus, number> = {
      [VehicleStatus.ENABLED]: 0,
      [VehicleStatus.OBSERVED]: 0,
      [VehicleStatus.NOT_ENABLED]: 0,
    };
    for (const vehicle of this.vehicles()) {
      summary[vehicle.currentStatus] += 1;
    }
    return summary;
  });

  readonly fleetOverviews = computed<FleetOverview[]>(() => {
    const vehicles = this.vehicles();
    const companies = this.companiesById();

    return this.fleets().map((fleet) => ({
      fleet,
      company: companies.get(fleet.companyId),
      vehicleCount: fleet.countVehicles(vehicles),
      enabledCount: fleet.countByStatus(vehicles, VehicleStatus.ENABLED),
      observedCount: fleet.countByStatus(vehicles, VehicleStatus.OBSERVED),
      notEnabledCount: fleet.countByStatus(vehicles, VehicleStatus.NOT_ENABLED),
    }));
  });

  constructor() {
    this.load();
  }

  getVehicleById = (id: string): Signal<Vehicle | undefined> =>
    computed(() => this.vehiclesById().get(id));

  getDriverById = (id: string): Signal<Driver | undefined> =>
    computed(() => this.driversById().get(id));

  getFleetById = (id: string): Signal<Fleet | undefined> =>
    computed(() => this.fleetsById().get(id));

  /**
   * Loads every collection of the context at once so the views always see a consistent snapshot.
   */
  load = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    forkJoin({
      companies: this.fleetApi.getCompanies(),
      fleets: this.fleetApi.getFleets(),
      vehicles: this.fleetApi.getVehicles(),
      drivers: this.fleetApi.getDrivers(),
      vehicleAssignments: this.fleetApi.getVehicleAssignments(),
    })
      .pipe(retry(2))
      .subscribe({
        next: ({ companies, fleets, vehicles, drivers, vehicleAssignments }) => {
          this.companiesSignal.set(companies);
          this.fleetsSignal.set(fleets);
          this.vehiclesSignal.set(vehicles);
          this.driversSignal.set(drivers);
          this.vehicleAssignmentsSignal.set(vehicleAssignments);
          this.loadedSignal.set(true);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('fleet.errors.loadFailed');
          this.loadingSignal.set(false);
        },
      });
  };

  /**
   * Loads the inspections performed on a vehicle, newest first.
   * @param vehicleId - Identifier of the vehicle.
   */
  loadVehicleInspections = (vehicleId: string): void => {
    this.inspectionsLoadingSignal.set(true);
    this.inspectionsErrorSignal.set(null);

    this.fleetApi
      .getVehicleInspections(vehicleId)
      .pipe(retry(2))
      .subscribe({
        next: (summaries) => {
          const newestFirst = [...summaries].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
          this.vehicleInspectionsSignal.update((current) => ({
            ...current,
            [vehicleId]: newestFirst,
          }));
          this.inspectionsLoadingSignal.set(false);
        },
        error: () => {
          this.inspectionsErrorSignal.set('fleet.errors.inspectionsFailed');
          this.inspectionsLoadingSignal.set(false);
        },
      });
  };

  /**
   * Forgets the outcome of the previous action, e.g. when a form is opened again.
   */
  clearActionError = (): void => this.actionErrorSignal.set(null);

  /**
   * Registers a vehicle in a fleet (US12).
   *
   * @param command - Description of the vehicle.
   * @param done - Called with the registered vehicle once it has been saved.
   */
  registerVehicle = (command: RegisterVehicleCommand, done?: (vehicle: Vehicle) => void): void => {
    if (this.savingSignal()) return;

    const details = command.details;
    if (!details.isValid()) {
      this.reject('fleet.errors.invalidVehicle');
      return;
    }
    if (!this.fleetsById().has(details.fleetId)) {
      this.reject('fleet.errors.fleetNotFound');
      return;
    }
    if (this.isPlateTaken(details.plate)) {
      this.reject('fleet.errors.plateTaken');
      return;
    }

    const vehicle = Vehicle.register({
      id: crypto.randomUUID(),
      details,
      now: new Date().toISOString(),
    });

    this.execute(this.fleetApi.createVehicle(vehicle), 'fleet.errors.saveFailed', (created) => {
      this.vehiclesSignal.update((vehicles) => [...vehicles, created]);
      this.notifier.success('fleet.notifications.vehicleRegistered', { plate: created.plate });
      done?.(created);
    });
  };

  /**
   * Updates the data of an existing vehicle (US15). Its operational condition is never touched.
   *
   * @param command - Identifier of the vehicle and its new description.
   * @param done - Called with the updated vehicle once it has been saved.
   */
  updateVehicle = (command: UpdateVehicleCommand, done?: (vehicle: Vehicle) => void): void => {
    if (this.savingSignal()) return;

    const existing = this.vehiclesById().get(command.vehicleId);
    if (!existing) {
      this.reject('fleet.errors.vehicleNotFound');
      return;
    }

    const details = command.details;
    if (!details.isValid()) {
      this.reject('fleet.errors.invalidVehicle');
      return;
    }
    if (this.isPlateTaken(details.plate, existing.id)) {
      this.reject('fleet.errors.plateTaken');
      return;
    }

    const vehicle = existing.withDetails(details, new Date().toISOString());

    this.execute(this.fleetApi.updateVehicle(vehicle), 'fleet.errors.saveFailed', (updated) => {
      this.vehiclesSignal.update((vehicles) =>
        vehicles.map((current) => (current.id === updated.id ? updated : current)),
      );
      this.notifier.success('fleet.notifications.vehicleUpdated', { plate: updated.plate });
      done?.(updated);
    });
  };

  /**
   * Removes a vehicle from the fleet.
   *
   * @param id - Identifier of the vehicle.
   * @param done - Called once the vehicle has been removed.
   */
  deleteVehicle = (id: string, done?: () => void): void => {
    if (this.savingSignal()) return;

    this.execute(this.fleetApi.deleteVehicle(id), 'fleet.errors.saveFailed', () => {
      this.vehiclesSignal.update((vehicles) => vehicles.filter((vehicle) => vehicle.id !== id));
      this.notifier.success('fleet.notifications.vehicleDeleted');
      done?.();
    });
  };

  /**
   * Assigns a vehicle to a driver (US16), provided {@link VehicleAssignmentPolicy} allows it.
   *
   * @param command - Vehicle and driver to assign.
   * @param done - Called with the new assignment once it has been saved.
   */
  assignVehicle = (
    command: AssignVehicleCommand,
    done?: (assignment: VehicleAssignment) => void,
  ): void => {
    if (this.savingSignal()) return;

    const now = new Date();
    const violation = VehicleAssignmentPolicy.check({
      vehicle: this.vehiclesById().get(command.vehicleId),
      driver: this.driversById().get(command.driverId),
      assignments: this.vehicleAssignments(),
      date: now,
    });
    if (violation) {
      this.reject(`fleet.errors.assignment.${violation}`);
      return;
    }

    const assignment = VehicleAssignment.start({
      id: crypto.randomUUID(),
      vehicleId: command.vehicleId,
      driverId: command.driverId,
      assignedFrom: localDate(now),
      createdAt: now.toISOString(),
    });

    this.execute(
      this.fleetApi.createVehicleAssignment(assignment),
      'fleet.errors.saveFailed',
      (created) => {
        this.vehicleAssignmentsSignal.update((assignments) => [...assignments, created]);
        this.notifier.success('fleet.notifications.vehicleAssigned');
        done?.(created);
      },
    );
  };

  /**
   * Ends an active assignment today. The assignment stays in the history of the vehicle.
   *
   * @param command - Assignment to end.
   */
  endAssignment = (command: EndVehicleAssignmentCommand): void => {
    if (this.savingSignal()) return;

    const now = new Date();
    const existing = this.vehicleAssignments().find(
      (assignment) => assignment.id === command.assignmentId,
    );
    if (!existing) {
      this.reject('fleet.errors.assignmentNotFound');
      return;
    }
    if (!existing.isActiveOn(now)) {
      this.reject('fleet.errors.assignmentNotActive');
      return;
    }

    const ended = existing.copy();
    ended.close(localDate(now));

    this.execute(
      this.fleetApi.updateVehicleAssignment(ended),
      'fleet.errors.saveFailed',
      (updated) => {
        this.vehicleAssignmentsSignal.update((assignments) =>
          assignments.map((current) => (current.id === updated.id ? updated : current)),
        );
        this.notifier.success('fleet.notifications.assignmentEnded');
      },
    );
  };

  private isPlateTaken = (plate: string, exceptVehicleId?: string): boolean =>
    this.vehicles().some((vehicle) => vehicle.id !== exceptVehicleId && vehicle.hasPlate(plate));

  private reject = (errorKey: string): void => {
    this.actionErrorSignal.set(errorKey);
  };

  /**
   * Runs a write request keeping `saving` and `actionError` up to date.
   *
   * @remarks
   * Writes are not retried: repeating a POST could register the same vehicle twice.
   */
  private execute = <T>(
    request: Observable<T>,
    failureKey: string,
    onSuccess: (result: T) => void,
  ): void => {
    this.savingSignal.set(true);
    this.actionErrorSignal.set(null);

    request.subscribe({
      next: (result) => {
        this.savingSignal.set(false);
        onSuccess(result);
      },
      error: () => {
        this.actionErrorSignal.set(failureKey);
        this.savingSignal.set(false);
      },
    });
  };
}
