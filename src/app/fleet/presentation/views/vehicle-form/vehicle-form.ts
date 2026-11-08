import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { FleetStore } from '../../../application/fleet.store';
import { RegisterVehicleCommand } from '../../../domain/model/register-vehicle.command';
import { UpdateVehicleCommand } from '../../../domain/model/update-vehicle.command';
import {
  maxVehicleYear,
  normalizePlate,
  PLATE_PATTERN,
  VEHICLE_MIN_YEAR,
  VEHICLE_TEXT_MAX_LENGTH,
  VehicleDetails,
} from '../../../domain/model/vehicle-details.value-object';
import { VehicleType } from '../../../domain/model/vehicle-type.enum';
import { VehicleStatusBadge } from '../../components/vehicle-status-badge/vehicle-status-badge';

/**
 * Registers a new vehicle (US12) or updates an existing one (US15).
 *
 * @remarks
 * The same view serves both routes: `vehicles/new` and `vehicles/:id/edit`. The operational
 * condition of the vehicle is never part of the form.
 */
@Component({
  selector: 'app-vehicle-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    VehicleStatusBadge,
  ],
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.css',
})
export class VehicleForm extends BaseForm {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(FleetStore);

  protected readonly vehicleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    {
      initialValue: this.route.snapshot.paramMap.get('id'),
    },
  );

  protected readonly isEdit = computed(() => this.vehicleId() !== null);

  protected readonly vehicle = computed(() => {
    const id = this.vehicleId();
    return id === null ? undefined : this.store.vehiclesById().get(id);
  });

  protected readonly notFound = computed(
    () => this.isEdit() && this.store.loaded() && this.vehicle() === undefined,
  );

  protected readonly vehicleTypes = Object.values(VehicleType);
  protected readonly minYear = VEHICLE_MIN_YEAR;
  protected readonly maxYear = maxVehicleYear();
  protected readonly textMaxLength = VEHICLE_TEXT_MAX_LENGTH;

  private readonly plateFormat: ValidatorFn = (control) =>
    PLATE_PATTERN.test(normalizePlate(String(control.value ?? ''))) ? null : { plateFormat: true };

  private readonly plateAvailable: ValidatorFn = (control) =>
    this.store
      .vehicles()
      .some(
        (vehicle) =>
          vehicle.id !== this.vehicleId() && vehicle.hasPlate(String(control.value ?? '')),
      )
      ? { plateTaken: true }
      : null;

  protected readonly form = this.fb.group({
    fleetId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    plate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, this.plateFormat, this.plateAvailable],
    }),
    brand: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(VEHICLE_TEXT_MAX_LENGTH)],
    }),
    model: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(VEHICLE_TEXT_MAX_LENGTH)],
    }),
    year: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(VEHICLE_MIN_YEAR),
      Validators.max(maxVehicleYear()),
    ]),
    type: new FormControl<VehicleType | null>(null, [Validators.required]),
    capacity: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(Number.MIN_VALUE),
    ]),
  });

  private populated = false;

  constructor() {
    super();
    this.store.clearActionError();

    effect(() => {
      const vehicle = this.vehicle();
      if (!vehicle || this.populated) return;

      this.populated = true;
      this.form.patchValue({
        fleetId: vehicle.fleetId,
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        type: vehicle.type,
        capacity: vehicle.capacity,
      });
      this.form.controls.fleetId.disable();
    });

    effect(() => {
      const fleets = this.store.fleets();
      if (!this.isEdit() && fleets.length === 1 && this.form.controls.fleetId.value === '') {
        this.form.controls.fleetId.setValue(fleets[0].id);
      }
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const details = new VehicleDetails({
      fleetId: value.fleetId,
      plate: value.plate,
      brand: value.brand,
      model: value.model,
      year: value.year!,
      type: value.type!,
      capacity: value.capacity!,
    });
    const goToList = (): void => {
      this.router.navigate(['/fleet/vehicles']).then();
    };

    const id = this.vehicleId();
    if (id === null) {
      this.store.registerVehicle(new RegisterVehicleCommand({ details }), goToList);
    } else {
      this.store.updateVehicle(new UpdateVehicleCommand({ vehicleId: id, details }), goToList);
    }
  }
}
