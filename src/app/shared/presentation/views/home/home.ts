import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EvaluationStore } from '../../../../evaluation/application/evaluation.store';
import { OperationalStatus } from '../../../../evaluation/domain/model/operational-status.enum';
import { Incident } from '../../../../incident/domain/model/incident.entity';
import { IncidentApi } from '../../../../incident/infrastructure/incident-api';
import { IncidentStatus } from '../../../../incident/domain/model/incident-status.enum';
import { IncidentSeverity } from '../../../../incident/domain/model/incident-severity.enum';
import { Inspection } from '../../../../inspection/domain/model/inspection.entity';
import { InspectionApi } from '../../../../inspection/infrastructure/inspection-api';

/**
 * Dashboard view for fleet management.
 */
@Component({
  selector: 'app-home',
  imports: [TranslatePipe, DatePipe, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly evaluationStore = inject(EvaluationStore);
  private readonly incidentApi = inject(IncidentApi);
  private readonly inspectionApi = inject(InspectionApi);

  readonly incidents = signal<Incident[]>([]);
  readonly inspections = signal<Inspection[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  readonly vehicleCounts = this.evaluationStore.counts;

  readonly enabledVehicles = computed(() => this.vehicleCounts()[OperationalStatus.ENABLED]);

  readonly openIncidents = computed(() =>
    this.incidents().filter(
      (incident) =>
        incident.status === IncidentStatus.REGISTERED ||
        incident.status === IncidentStatus.IN_REVIEW,
    ),
  );

  readonly criticalIncidents = computed(
    () =>
      this.openIncidents().filter((incident) => incident.severity === IncidentSeverity.CRITICAL)
        .length,
  );

  readonly recentInspections = computed(() =>
    [...this.inspections()]
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 3),
  );

  readonly pendingIncidents = computed(() =>
    [...this.openIncidents()]
      .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
      .slice(0, 3),
  );

  constructor() {
    this.evaluationStore.load();
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.error.set(false);

    forkJoin({
      incidents: this.incidentApi.getIncidents().pipe(
        catchError(() => {
          this.error.set(true);
          return of([] as Incident[]);
        }),
      ),
      inspections: this.inspectionApi.getInspections().pipe(
        catchError(() => {
          this.error.set(true);
          return of([] as Inspection[]);
        }),
      ),
    }).subscribe(({ incidents, inspections }) => {
      this.incidents.set(incidents);
      this.inspections.set(inspections);
      this.loading.set(false);
    });
  }
}
