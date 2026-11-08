import { Component, computed, effect, inject } from '@angular/core';
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

  private readonly inspectionId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  constructor() {
    if (this.store.currentInspection()?.id !== this.inspectionId) this.store.loadInspection(this.inspectionId);
    effect(() => {
      const inspection = this.store.currentInspection();
      if (inspection?.id === this.inspectionId) this.store.loadVehicleStatus(inspection.vehicleId);
    });
  }

  protected backToStart(): void {
    this.router.navigate(['/inspections', 'new']);
  }
}
