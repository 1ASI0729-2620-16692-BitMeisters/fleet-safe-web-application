import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import { IncidentStore } from '../../../application/incident.store';
import { RegisterCorrectiveActionCommand } from '../../../domain/model/register-corrective-action.command';

/**
 * Registers a corrective action for an incident.
 */
@Component({
  selector: 'app-corrective-action-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './corrective-action-form.html',
  styleUrl: './corrective-action-form.css',
})
export class CorrectiveActionForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(IncidentStore);

  /**
   * Form group for the corrective action form.
   */
  private iamStore = inject(IamStore);

  private localNow(): string {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  form = this.fb.group({
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    performedAt: new FormControl<string>(this.localNow(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    evidenceUrl: new FormControl<string>('', { nonNullable: true }),
  });

  /**
   * The incident ID from the route.
   */
  private incidentId: string;

  constructor() {
    this.incidentId = this.route.snapshot.params['id'];
  }

  /**
   * Submits the form to register the corrective action.
   */
  submit() {
    if (this.form.invalid) return;

    const command = new RegisterCorrectiveActionCommand({
      incidentId: this.incidentId,
      description: this.form.value.description!,
      performedBy: this.iamStore.currentUser()?.id ?? '',
      performedAt: new Date(this.form.value.performedAt!).toISOString(),
      evidenceUrl: this.form.value.evidenceUrl ?? '',
    });

    this.store.registerCorrectiveAction(command);
    this.router.navigate(['incidents', this.incidentId]).then();
  }

  /**
   * Cancels the form and navigates back.
   */
  cancel() {
    this.router.navigate(['incidents', this.incidentId]).then();
  }
}
