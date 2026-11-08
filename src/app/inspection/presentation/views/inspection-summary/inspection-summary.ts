import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { InspectionStore } from '../../../application/inspection.store';
import { ResultValue } from '../../../domain/model/result-value.enum';

@Component({
  selector: 'app-inspection-summary',
  imports: [DatePipe, DecimalPipe, MatButtonModule, MatCardModule, TranslatePipe],
  templateUrl: './inspection-summary.html',
  styleUrl: './inspection-summary.css',
})
export class InspectionSummary {
  protected readonly store = inject(InspectionStore);
  private readonly router = inject(Router);
  private readonly inspectionId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  private readonly results = computed(() => this.store.currentInspection()?.results ?? []);
  protected readonly compliant = computed(() => this.count(ResultValue.OK));
  protected readonly observed = computed(() => this.count(ResultValue.OBSERVED));
  protected readonly failed = computed(() => this.count(ResultValue.FAIL));
  protected readonly findings = computed(() => this.results().filter((result) => result.result !== ResultValue.OK));
  protected readonly pendingFindings = computed(() =>
    this.findings().filter((finding) => {
      const item = this.store.inspectionItems().find((candidate) => candidate.id === finding.inspectionItemId);
      const observation = finding.observations[0];
      return !observation || (item?.requiresEvidence && observation.evidences.length === 0);
    }),
  );

  constructor() {
    if (this.store.currentInspection()?.id !== this.inspectionId) this.store.loadInspection(this.inspectionId);
  }

  protected back(): void {
    this.router.navigate(['/inspections', this.inspectionId, 'execute']);
  }

  protected submit(): void {
    this.store.submitInspection(() => this.router.navigate(['/inspections', this.inspectionId, 'result']));
  }

  private count(result: ResultValue): number {
    return this.results().filter((entry) => entry.result === result).length;
  }
}
