import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, retry } from 'rxjs';
import { OperationalStatus } from '../domain/model/operational-status.enum';
import { VehicleCondition } from '../domain/model/vehicle-condition.entity';
import { EvaluationApi } from '../infrastructure/evaluation-api';

export type StatusFilter = OperationalStatus | 'ALL';

@Injectable({ providedIn: 'root' })
export class EvaluationStore {
  private readonly evaluationApi = inject(EvaluationApi);

  private readonly conditionsSignal = signal<VehicleCondition[]>([]);
  readonly conditions = this.conditionsSignal.asReadonly();

  private readonly statusFilterSignal = signal<StatusFilter>('ALL');
  readonly statusFilter = this.statusFilterSignal.asReadonly();

  readonly filteredConditions = computed(() => {
    const filter = this.statusFilterSignal();
    return this.conditionsSignal()
      .filter((condition) => filter === 'ALL' || condition.status === filter)
      .sort((a, b) => a.plate.localeCompare(b.plate));
  });

  readonly counts = computed(() => {
    const counts = Object.fromEntries(Object.values(OperationalStatus).map((status) => [status, 0])) as Record<
      OperationalStatus,
      number
    >;
    for (const condition of this.conditionsSignal()) counts[condition.status]++;
    return counts;
  });

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<boolean>(false);
  readonly error = this.errorSignal.asReadonly();

  load = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(false);
    forkJoin({
      vehicles: this.evaluationApi.getVehicles(),
      authorizations: this.evaluationApi.getCurrentAuthorizations(),
    })
      .pipe(retry(2))
      .subscribe({
        next: ({ vehicles, authorizations }) => {
          this.conditionsSignal.set(VehicleCondition.fromVehicles(vehicles, authorizations));
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set(true);
          this.loadingSignal.set(false);
        },
      });
  };

  filterByStatus = (filter: StatusFilter): void => this.statusFilterSignal.set(filter);
}
