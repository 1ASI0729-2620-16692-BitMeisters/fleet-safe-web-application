import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { FleetStore } from '../../../application/fleet.store';
import { VehicleStatus } from '../../../domain/model/vehicle-status.enum';
import { VehicleStatusBadge } from '../../components/vehicle-status-badge/vehicle-status-badge';

type StatusFilter = VehicleStatus | 'ALL';

@Component({
  selector: 'app-vehicle-list',
  imports: [
    RouterLink,
    TranslatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    VehicleStatusBadge,
  ],
  templateUrl: './vehicle-list.html',
  styleUrl: './vehicle-list.css',
})
export class VehicleList {
  protected readonly store = inject(FleetStore);

  protected readonly displayedColumns = [
    'plate',
    'brand',
    'model',
    'year',
    'type',
    'status',
    'actions',
  ];

  protected readonly statuses = Object.values(VehicleStatus);
  protected readonly pageSizeOptions = [5, 10, 20];

  protected readonly search = signal('');
  protected readonly statusFilter = signal<StatusFilter>('ALL');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  /**
   * Vehicles that match the text typed and the status chosen (US13).
   */
  protected readonly filteredVehicles = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.store
      .vehicles()
      .filter(
        (vehicle) =>
          (status === 'ALL' || vehicle.currentStatus === status) &&
          (term === '' ||
            `${vehicle.plate} ${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(term)),
      );
  });

  protected readonly pageVehicles = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredVehicles().slice(start, start + this.pageSize());
  });

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
    this.pageIndex.set(0);
  }

  protected onStatusFilter(status: StatusFilter): void {
    this.statusFilter.set(status);
    this.pageIndex.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
