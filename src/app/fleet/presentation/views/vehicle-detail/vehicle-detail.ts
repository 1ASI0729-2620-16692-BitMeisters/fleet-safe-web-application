import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { map } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { FleetStore } from '../../../application/fleet.store';
import { VehicleStatusBadge } from '../../components/vehicle-status-badge/vehicle-status-badge';

/**
 * Shows everything Fleet Management knows about a vehicle (US14): its data, its condition, who
 * drives it, who drove it before and the inspections performed on it.
 */
@Component({
  selector: 'app-vehicle-detail',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TranslatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    VehicleStatusBadge,
  ],
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.css',
})
export class VehicleDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly store = inject(FleetStore);

  protected readonly vehicleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  protected readonly vehicle = computed(() => this.store.vehiclesById().get(this.vehicleId()));

  protected readonly fleet = computed(() => {
    const vehicle = this.vehicle();
    return vehicle ? this.store.fleetsById().get(vehicle.fleetId) : undefined;
  });

  protected readonly company = computed(() => {
    const fleet = this.fleet();
    return fleet ? this.store.companiesById().get(fleet.companyId) : undefined;
  });

  protected readonly activeAssignment = computed(
    () => this.vehicle()?.getActiveAssignment(this.store.vehicleAssignments()) ?? null,
  );

  protected readonly activeDriver = computed(() => {
    const assignment = this.activeAssignment();
    return assignment ? this.store.driversById().get(assignment.driverId) : undefined;
  });

  protected readonly assignmentHistory = computed(() =>
    this.store
      .vehicleAssignments()
      .filter((assignment) => assignment.vehicleId === this.vehicleId())
      .sort((a, b) => b.assignedFrom.localeCompare(a.assignedFrom)),
  );

  protected readonly inspections = computed(
    () => this.store.vehicleInspections()[this.vehicleId()] ?? [],
  );

  protected readonly inspectionsRequested = computed(
    () => this.vehicleId() in this.store.vehicleInspections(),
  );

  protected readonly assignmentColumns = ['driver', 'assignedFrom', 'assignedTo', 'state'];
  protected readonly inspectionColumns = ['startedAt', 'status', 'odometer', 'driver'];

  constructor() {
    effect(() => {
      const id = this.vehicleId();
      if (id) {
        untracked(() => this.store.loadVehicleInspections(id));
      }
    });
  }

  /**
   * Gives the license number of a driver, or an empty text when the driver is not known.
   * @param driverId - Identifier of the driver.
   */
  protected driverLicense(driverId: string): string {
    return this.store.driversById().get(driverId)?.licenseNumber ?? '';
  }

  /**
   * Answers whether an assignment is in force today.
   * @param assignmentId - Identifier of the assignment.
   */
  protected isCurrent(assignmentId: string): boolean {
    return this.activeAssignment()?.id === assignmentId;
  }
}
