import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { VehicleStatus } from '../../../domain/model/vehicle-status.enum';

/**
 * Shows the operational condition of a vehicle with a color and its translated name.
 *
 * @remarks
 * The condition is always written out, never conveyed by color alone.
 */
@Component({
  selector: 'app-vehicle-status-badge',
  imports: [TranslatePipe],
  template: `
    <span [class]="'badge badge-' + status().toLowerCase().replace('_', '-')">
      {{ 'fleet.status.' + status() | translate }}
    </span>
  `,
  styleUrl: './vehicle-status-badge.css',
})
export class VehicleStatusBadge {
  readonly status = input.required<VehicleStatus>();
}
