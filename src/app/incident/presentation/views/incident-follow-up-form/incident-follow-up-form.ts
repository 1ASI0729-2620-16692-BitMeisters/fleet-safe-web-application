import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import { IncidentStore } from '../../../application/incident.store';
import { AddIncidentFollowUpCommand } from '../../../domain/model/add-incident-follow-up.command';

/**
 * Adds a follow-up note to an incident.
 */
@Component({
  selector: 'app-incident-follow-up-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
  ],
  templateUrl: './incident-follow-up-form.html',
  styleUrl: './incident-follow-up-form.css',
})
export class IncidentFollowUpForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(IncidentStore);

  /**
   * Form group for the follow-up form.
   */
  private iamStore = inject(IamStore);

  form = this.fb.group({
    note: new FormControl<string>('', {
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
   * Submits the form to add the follow-up.
   */
  submit() {
    if (this.form.invalid) return;

    const command = new AddIncidentFollowUpCommand({
      incidentId: this.incidentId,
      note: this.form.value.note!,
      createdBy: this.iamStore.currentUser()?.id ?? '',
      createdAt: new Date().toISOString(),
    });

    this.store.addIncidentFollowUp(command);
    this.router.navigate(['incidents', this.incidentId]).then();
  }

  /**
   * Cancels the form and navigates back.
   */
  cancel() {
    this.router.navigate(['incidents', this.incidentId]).then();
  }
}
