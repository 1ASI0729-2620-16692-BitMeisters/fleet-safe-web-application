import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { InspectionStore } from '../../../application/inspection.store';
import { VehicleOperationalStatus } from '../../../domain/model/vehicle-operational-status.enum';

const ICONS: Record<VehicleOperationalStatus, string> = {
  [VehicleOperationalStatus.ENABLED]: 'check_circle',
  [VehicleOperationalStatus.OBSERVED]: 'info',
  [VehicleOperationalStatus.NOT_ENABLED]: 'error',
};

@Component({
  selector: 'app-inspection-result',
  imports: [MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './inspection-result.html',
  styleUrl: './inspection-result.css',
})
export class InspectionResult {
  protected readonly store = inject(InspectionStore);
  private readonly router = inject(Router);
  protected readonly icon = computed(() => {
    const status = this.store.vehicleStatus();
    return status ? ICONS[status] : 'hourglass_empty';
  });

  constructor() {
    const vehicleId = this.store.currentInspection()?.vehicleId ?? this.store.assignedVehicle()?.vehicleId;
    if (vehicleId) this.store.loadVehicleStatus(vehicleId);
    else this.router.navigate(['/inspections', inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '', 'summary']);
  }

  protected backToStart(): void {
    this.router.navigate(['/inspections', 'new']);
  }
}
