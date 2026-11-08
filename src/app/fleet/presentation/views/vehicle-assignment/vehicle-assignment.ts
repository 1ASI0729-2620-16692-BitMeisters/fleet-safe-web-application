import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { FleetStore } from '../../../application/fleet.store';
import { AssignVehicleCommand } from '../../../domain/model/assign-vehicle.command';
import { EndVehicleAssignmentCommand } from '../../../domain/model/end-vehicle-assignment.command';

/**
 * One line of the assignment table, ready to be shown.
 */
interface AssignmentRow {
  readonly id: string;
  readonly vehicleId: string;
  readonly plate: string | null;
  readonly driverLicense: string | null;
  readonly assignedFrom: string;
  readonly assignedTo: string | null;
  readonly active: boolean;
}

/**
 * Assigns vehicles to drivers (US16), ends assignments and shows their history.
 */
@Component({
  selector: 'app-vehicle-assignment',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './vehicle-assignment.html',
  styleUrl: './vehicle-assignment.css',
})
export class VehicleAssignment extends BaseForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(FleetStore);

  protected readonly form = this.fb.group({
    vehicleId: new FormControl<string | null>(null, [Validators.required]),
    driverId: new FormControl<string | null>(null, [Validators.required]),
  });

  protected readonly displayedColumns = [
    'vehicle',
    'driver',
    'assignedFrom',
    'assignedTo',
    'state',
    'actions',
  ];

  /**
   * Assignments in force first, then the most recent ones.
   */
  protected readonly rows = computed<AssignmentRow[]>(() => {
    const now = new Date();
    const vehicles = this.store.vehiclesById();
    const drivers = this.store.driversById();

    return this.store
      .vehicleAssignments()
      .map((assignment) => ({
        id: assignment.id,
        vehicleId: assignment.vehicleId,
        plate: vehicles.get(assignment.vehicleId)?.plate ?? null,
        driverLicense: drivers.get(assignment.driverId)?.licenseNumber ?? null,
        assignedFrom: assignment.assignedFrom,
        assignedTo: assignment.assignedTo,
        active: assignment.isActiveOn(now),
      }))
      .sort(
        (a, b) =>
          Number(b.active) - Number(a.active) || b.assignedFrom.localeCompare(a.assignedFrom),
      );
  });

  private readonly formDirective = viewChild(FormGroupDirective);

  private preselected = false;

  constructor() {
    super();
    this.store.clearActionError();

    effect(() => {
      const requested = this.route.snapshot.queryParamMap.get('vehicleId');
      const available = this.store.availableVehicles();
      if (this.preselected || !requested) return;

      if (available.some((vehicle) => vehicle.id === requested)) {
        this.preselected = true;
        this.form.controls.vehicleId.setValue(requested);
      }
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { vehicleId, driverId } = this.form.getRawValue();
    // resetForm also clears the "submitted" state, so the fresh form does not show errors.
    this.store.assignVehicle(
      new AssignVehicleCommand({ vehicleId: vehicleId!, driverId: driverId! }),
      () => this.formDirective()?.resetForm(),
    );
  }

  protected end(assignmentId: string): void {
    this.store.endAssignment(new EndVehicleAssignmentCommand({ assignmentId }));
  }
}
