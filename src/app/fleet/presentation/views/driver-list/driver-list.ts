import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { FleetStore } from '../../../application/fleet.store';
import { Driver } from '../../../domain/model/driver.entity';
import { Vehicle } from '../../../domain/model/vehicle.entity';

/**
 * One line of the driver table: the driver, the state of the license and the vehicle in use.
 */
interface DriverRow {
  readonly driver: Driver;
  readonly hasValidLicense: boolean;
  readonly hasAssignment: boolean;
  readonly vehicle: Vehicle | undefined;
}

@Component({
  selector: 'app-driver-list',
  imports: [
    DatePipe,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './driver-list.html',
  styleUrl: './driver-list.css',
})
export class DriverList {
  protected readonly store = inject(FleetStore);

  protected readonly displayedColumns = [
    'licenseNumber',
    'licenseExpirationDate',
    'licenseStatus',
    'assignedVehicle',
    'userId',
  ];

  protected readonly rows = computed<DriverRow[]>(() => {
    const assignments = this.store.vehicleAssignments();
    const vehicles = this.store.vehiclesById();
    const now = new Date();

    return this.store.drivers().map((driver) => {
      const assignment = driver.getActiveAssignment(assignments, now);

      return {
        driver,
        hasValidLicense: driver.hasValidLicense(),
        hasAssignment: assignment !== null,
        vehicle: assignment ? vehicles.get(assignment.vehicleId) : undefined,
      };
    });
  });
}
