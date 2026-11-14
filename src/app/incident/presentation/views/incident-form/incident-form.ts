import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IncidentStore } from '../../../application/incident.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { Incident } from '../../../domain/model/incident.entity';
import { IncidentOrigin } from '../../../domain/model/incident-origin.enum';
import { IncidentSeverity } from '../../../domain/model/incident-severity.enum';
import { IncidentStatus } from '../../../domain/model/incident-status.enum';

/**
 * Creates and edits incident entities.
 */
@Component({
  selector: 'app-incident-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    DatePipe,
  ],
  templateUrl: './incident-form.html',
  styleUrl: './incident-form.css',
})
export class IncidentForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(IncidentStore);
  private iamStore = inject(IamStore);
  private reportedBy: string | null = null;

  /**
   * Form group for the incident form.
   */
  form = this.fb.group({
    vehicleId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    incidentTypeId: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    inspectionId: new FormControl<string | null>(null),
    origin: new FormControl<IncidentOrigin>(IncidentOrigin.OPERATION, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    severity: new FormControl<IncidentSeverity>(IncidentSeverity.MEDIUM, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  vehicles = this.store.vehicles;

  inspectionsOfVehicle = this.store.inspectionsOfVehicle;

  /**
   * Signal for the list of incident types.
   */
  incidentTypes = this.store.incidentTypes;

  /**
   * Available incident origins.
   */
  origins = Object.values(IncidentOrigin);

  /**
   * Available incident severities.
   */
  severities = Object.values(IncidentSeverity);

  /**
   * Indicates if the form is in edit mode.
   */
  isEdit = false;

  /**
   * The ID of the incident being edited, or null for new incidents.
   */
  incidentId: string | null = null;

  constructor() {
    this.form.controls.vehicleId.valueChanges.subscribe((vehicleId) => {
      this.form.controls.inspectionId.setValue(null);
      this.store.loadInspectionsOfVehicle(vehicleId);
    });
    this.route.params.subscribe((params) => {
      this.incidentId = params['id'] ? params['id'] : null;
      this.isEdit = !!this.incidentId;

      if (this.isEdit && this.incidentId) {
        const id = this.incidentId;
        const incident = this.store.getIncidentById(id)();
        if (incident) {
          this.form.patchValue({
            vehicleId: incident.vehicleId,
            incidentTypeId: incident.incidentTypeId,
            inspectionId: incident.inspectionId,
            origin: incident.origin,
            description: incident.description,
            severity: incident.severity,
          });
          this.reportedBy = incident.reportedBy;
        }
      }
    });
  }

  /**
   * Submits the form to create or update the incident.
   */
  async submit() {
    if (this.form.invalid) return;

    const reportedBy = this.reportedBy ?? this.iamStore.currentUser()?.id;

    if (!reportedBy) return;

    const incident = new Incident({
      id: this.incidentId ?? crypto.randomUUID(),
      vehicleId: this.form.controls.vehicleId.value,
      incidentTypeId: this.form.controls.incidentTypeId.value!,
      inspectionId:
        this.form.controls.origin.value === IncidentOrigin.INSPECTION
          ? this.form.controls.inspectionId.value
          : null,
      origin: this.form.controls.origin.value,
      description: this.form.controls.description.value,
      severity: this.form.controls.severity.value,
      status: IncidentStatus.REGISTERED,
      reportedBy,
      reportedAt: new Date().toISOString(),
    });

    const success = this.isEdit
      ? await this.store.updateIncident(incident)
      : await this.store.addIncident(incident);

    if (success) {
      await this.router.navigate(['incidents']);
    }
  }

  /**
   * Cancels the form and navigates back.
   */
  cancel() {
    this.router.navigate(['incidents']).then();
  }
}
