import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concatMap, from, last, of, retry, switchMap } from 'rxjs';
import { Notifier } from '../../shared/application/notifier';
import { AssignedVehicle } from '../domain/model/assigned-vehicle.entity';
import { InspectionItem } from '../domain/model/inspection-item.entity';
import { Inspection } from '../domain/model/inspection.entity';
import { ResultValue } from '../domain/model/result-value.enum';
import { VehicleOperationalStatus } from '../domain/model/vehicle-operational-status.enum';
import { InspectionApi } from '../infrastructure/inspection-api';

@Injectable({ providedIn: 'root' })
export class InspectionStore {
  private readonly inspectionApi = inject(InspectionApi);
  private readonly notifier = inject(Notifier);

  private readonly inspectionItemsSignal = signal<InspectionItem[]>([]);
  readonly inspectionItems = this.inspectionItemsSignal.asReadonly();

  readonly activeInspectionItems = computed(() =>
    this.inspectionItems()
      .filter((item) => item.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder),
  );

  private readonly assignedVehicleSignal = signal<AssignedVehicle | null>(null);
  readonly assignedVehicle = this.assignedVehicleSignal.asReadonly();

  private readonly noVehicleAssignedSignal = signal<boolean>(false);
  readonly noVehicleAssigned = this.noVehicleAssignedSignal.asReadonly();

  private readonly currentInspectionSignal = signal<Inspection | null>(null);
  readonly currentInspection = this.currentInspectionSignal.asReadonly();

  private readonly savingItemIdSignal = signal<string | null>(null);
  readonly savingItemId = this.savingItemIdSignal.asReadonly();

  private readonly savingFindingSignal = signal<boolean>(false);
  readonly savingFinding = this.savingFindingSignal.asReadonly();

  private readonly submittingSignal = signal<boolean>(false);
  readonly submitting = this.submittingSignal.asReadonly();

  private readonly vehicleStatusSignal = signal<VehicleOperationalStatus | null>(null);
  readonly vehicleStatus = this.vehicleStatusSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  constructor() {
    this.loadInspectionItems();
    this.loadAssignedVehicle();
  }

  loadInspectionItems = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inspectionApi
      .getInspectionItems()
      .pipe(takeUntilDestroyed(), retry(2))
      .subscribe({
        next: (items) => {
          this.inspectionItemsSignal.set(items);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load the inspection items'));
          this.loadingSignal.set(false);
        },
      });
  };

  loadAssignedVehicle = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.noVehicleAssignedSignal.set(false);
    this.inspectionApi
      .getAssignedVehicle()
      .pipe(takeUntilDestroyed(), retry(2))
      .subscribe({
        next: (vehicle) => {
          this.assignedVehicleSignal.set(vehicle);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          if (this.isNotFound(err)) {
            this.noVehicleAssignedSignal.set(true);
          } else {
            this.errorSignal.set(this.formatError(err, 'Failed to load the assigned vehicle'));
          }
          this.loadingSignal.set(false);
        },
      });
  };

  loadInspection = (id: string): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.inspectionApi
      .getInspection(id)
      .pipe(retry(2))
      .subscribe({
        next: (inspection) => {
          this.currentInspectionSignal.set(inspection);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load the inspection'));
          this.loadingSignal.set(false);
        },
      });
  };

  startInspection = (inspection: Inspection): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.currentInspectionSignal.set(inspection);
    this.inspectionApi
      .createInspection(inspection)
      .pipe(retry(2))
      .subscribe({
        next: (createdInspection) => {
          this.currentInspectionSignal.set(createdInspection);
          this.loadingSignal.set(false);
          this.notifier.success('inspection.notifications.started');
        },
        error: (err) => {
          this.currentInspectionSignal.set(null);
          this.errorSignal.set(this.formatError(err, 'Failed to start the inspection'));
          this.loadingSignal.set(false);
        },
      });
  };

  answerItem = (item: InspectionItem, result: ResultValue): void => {
    const inspection = this.currentInspectionSignal();
    if (!inspection) return;

    const existing = inspection.resultFor(item.id);
    if (existing?.result === result) return;

    const request = existing
      ? this.inspectionApi.updateResult(inspection.id, existing.id, result)
      : this.inspectionApi.registerResult(inspection.id, item.id, result);

    this.savingItemIdSignal.set(item.id);
    this.errorSignal.set(null);
    request.subscribe({
      next: (saved) => {
        const current = this.currentInspectionSignal();
        if (current) this.currentInspectionSignal.set(current.withResult(saved));
        this.savingItemIdSignal.set(null);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to save the answer'));
        this.savingItemIdSignal.set(null);
      },
    });
  };

  saveFinding = (item: InspectionItem, description: string, photos: File[], done: () => void): void => {
    const inspection = this.currentInspectionSignal();
    const result = inspection?.resultFor(item.id);
    if (!inspection || !result || this.savingFindingSignal()) return;

    const existing = result.observations[0];
    const observation$ = existing
      ? of(existing)
      : this.inspectionApi.addObservation(inspection.id, result.id, description);

    this.savingFindingSignal.set(true);
    this.errorSignal.set(null);
    observation$
      .pipe(
        switchMap((observation) =>
          photos.length === 0
            ? of(observation)
            : from(photos).pipe(
                concatMap((photo) => this.inspectionApi.attachEvidence(inspection.id, observation.id, photo)),
                last(),
              ),
        ),
        switchMap(() => this.inspectionApi.getInspection(inspection.id)),
      )
      .subscribe({
        next: (updated) => {
          this.currentInspectionSignal.set(updated);
          this.savingFindingSignal.set(false);
          done();
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to save the finding'));
          this.savingFindingSignal.set(false);
        },
      });
  };

  submitInspection = (done: (inspection: Inspection) => void): void => {
    const inspection = this.currentInspectionSignal();
    if (!inspection || this.submittingSignal()) return;

    this.submittingSignal.set(true);
    this.errorSignal.set(null);
    this.inspectionApi.completeInspection(inspection.id).subscribe({
      next: (completed) => {
        this.currentInspectionSignal.set(completed);
        this.submittingSignal.set(false);
        done(completed);
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to submit the inspection'));
        this.submittingSignal.set(false);
      },
    });
  };

  loadVehicleStatus = (vehicleId: string): void => {
    this.vehicleStatusSignal.set(null);
    this.inspectionApi
      .getVehicleStatus(vehicleId)
      .pipe(retry(2))
      .subscribe({
        next: (status) => this.vehicleStatusSignal.set(status),
        error: (err) => this.errorSignal.set(this.formatError(err, 'Failed to load the result of the inspection')),
      });
  };

  private isNotFound = (error: unknown): boolean =>
    error instanceof Error && error.message.includes('Resource not found');

  private formatError = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  };
}
