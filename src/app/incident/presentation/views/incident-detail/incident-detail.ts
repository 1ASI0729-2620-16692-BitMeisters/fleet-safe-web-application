import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IncidentStore } from '../../../application/incident.store';
import { CompleteRepairCommand } from '../../../domain/model/complete-repair.command';
import { ResolveIncidentCommand } from '../../../domain/model/resolve-incident.command';
import { IncidentStatus } from '../../../domain/model/incident-status.enum';

/**
 * Displays detailed information about a single incident.
 */
@Component({
  selector: 'app-incident-detail',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './incident-detail.html',
  styleUrl: './incident-detail.css',
})
export class IncidentDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(IncidentStore);

  /**
   * The incident ID from the route.
   */
  readonly incidentId = computed(() => this.route.snapshot.params['id']);

  /**
   * The incident entity.
   */
  readonly incident = computed(() => this.store.getIncidentById(this.incidentId())());

  readonly plateOf = this.store.plateOf;

  readonly error = this.store.error;

  readonly loading = this.store.loading;

  readonly resolutionTypes = ['REPAIRED', 'REPLACED', 'NO_ACTION_REQUIRED'];

  readonly resolutionType = new FormControl<string | null>(null, [Validators.required]);

  readonly isOpen = computed(() => {
    const status = this.incident()?.status;
    return status === IncidentStatus.REGISTERED || status === IncidentStatus.IN_REVIEW;
  });

  /**
   * Moves the incident from REGISTERED to IN_REVIEW.
   */
  async moveToReview(): Promise<void> {
    if (this.incident()?.status !== IncidentStatus.REGISTERED) return;

    await this.store.updateIncidentStatus(this.incidentId());
  }

  async completeRepair(repairId: string): Promise<void> {
    await this.store.completeRepair(
      new CompleteRepairCommand({
        incidentId: this.incidentId(),
        repairId,
        finishedAt: new Date().toISOString(),
      }),
    );
  }

  async resolve(): Promise<void> {
    if (this.resolutionType.invalid) return;

    await this.store.resolveIncident(
      new ResolveIncidentCommand({
        incidentId: this.incidentId(),
        resolutionType: this.resolutionType.value!,
        resolvedAt: new Date().toISOString(),
      }),
    );
  }

  /**
   * Navigates to the corrective action form.
   */
  addCorrectiveAction() {
    if (this.incident()?.status !== IncidentStatus.IN_REVIEW) return;

    this.router.navigate(['incidents', this.incidentId(), 'corrective-actions', 'new']);
  }

  /**
   * Navigates to the repair form.
   */
  scheduleRepair() {
    this.router.navigate(['incidents', this.incidentId(), 'repairs', 'new']).then();
  }

  /**
   * Navigates to the follow-up form.
   */
  addFollowUp() {
    this.router.navigate(['incidents', this.incidentId(), 'follow-ups', 'new']).then();
  }

  /**
   * Navigates back to the incident list.
   */
  goBack() {
    this.router.navigate(['incidents']).then();
  }
}
