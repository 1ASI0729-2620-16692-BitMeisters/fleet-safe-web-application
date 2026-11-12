import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { InspectionStore } from '../../../application/inspection.store';
import { InspectionStatus } from '../../../domain/model/inspection-status.enum';
import { Inspection } from '../../../domain/model/inspection.entity';

@Component({
  selector: 'app-start-inspection',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './start-inspection.html',
  styleUrl: './start-inspection.css',
})
export class StartInspection extends BaseForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly store = inject(InspectionStore);

  form = this.fb.group({
    odometer: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  submit(): void {
    const vehicle = this.store.assignedVehicle();
    if (this.form.invalid || !vehicle) {
      this.form.markAllAsTouched();
      return;
    }

    const now = new Date();
    const inspection = new Inspection({
      id: crypto.randomUUID(),
      vehicleId: vehicle.vehicleId,
      driverId: vehicle.driverId,
      status: InspectionStatus.IN_PROGRESS,
      odometer: this.form.value.odometer!,
      startedAt: now,
      completedAt: null,
      results: [],
      createdAt: now,
      updatedAt: now,
    });

    this.store.startInspection(inspection, (created) =>
      this.router.navigate(['/inspections', created.id, 'execute']).then(),
    );
  }
}
