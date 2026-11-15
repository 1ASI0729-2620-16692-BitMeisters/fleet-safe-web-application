import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BaseForm } from '../../../../shared/presentation/components/base-form/base-form';
import { FleetStore } from '../../../application/fleet.store';
import { RegisterDriverCommand } from '../../../domain/model/register-driver.command';

const LICENSE_NUMBER_MAX_LENGTH = 20;
const USER_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Registers the driving license of a user account as a driver of the company (US16).
 */
@Component({
  selector: 'app-driver-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.css',
})
export class DriverForm extends BaseForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly store = inject(FleetStore);

  protected readonly licenseMaxLength = LICENSE_NUMBER_MAX_LENGTH;

  private readonly userIdFormat: ValidatorFn = (control) =>
    USER_ID_PATTERN.test(String(control.value ?? '').trim()) ? null : { userIdFormat: true };

  private readonly userAvailable: ValidatorFn = (control) =>
    this.store.drivers().some((driver) => driver.userId === String(control.value ?? '').trim())
      ? { driverTaken: true }
      : null;

  protected readonly form = this.fb.group({
    userId: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, this.userIdFormat, this.userAvailable],
    }),
    licenseNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(LICENSE_NUMBER_MAX_LENGTH)],
    }),
    licenseExpirationDate: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    super();
    this.store.clearActionError();
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.store.registerDriver(
      new RegisterDriverCommand({
        userId: value.userId,
        licenseNumber: value.licenseNumber,
        licenseExpirationDate: value.licenseExpirationDate,
      }),
      () => {
        this.router.navigate(['/fleet/drivers']).then();
      },
    );
  }
}
