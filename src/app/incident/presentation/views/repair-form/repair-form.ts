import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { IncidentStore } from '../../../application/incident.store';
import { ScheduleRepairCommand } from '../../../domain/model/schedule-repair.command';

/**
 * Schedules a repair for an incident.
 */
@Component({
  selector: 'app-repair-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './repair-form.html',
  styleUrl: './repair-form.css',
})
export class RepairForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(IncidentStore);

  /**
   * Form group for the repair form.
   */
  form = this.fb.group({
    workshop: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    cost: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    startedAt: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  /**
   * The incident ID from the route.
   */
  private incidentId: string;

  constructor() {
    this.incidentId = this.route.snapshot.params['id'];
  }

  /**
   * Submits the form to schedule the repair.
   */
  async submit() {
    if (this.form.invalid) return;

    const command = new ScheduleRepairCommand({
      incidentId: this.incidentId,
      workshop: this.form.controls.workshop.value,
      cost: this.form.controls.cost.value,
      startedAt: new Date(this.form.controls.startedAt.value).toISOString(),
      finishedAt: null,
    });

    const success = await this.store.scheduleRepair(command);

    if (success) {
      await this.router.navigate(['incidents', this.incidentId]);
    }
  }

  /**
   * Cancels the form and navigates back.
   */
  cancel() {
    this.router.navigate(['incidents', this.incidentId]).then();
  }
}
