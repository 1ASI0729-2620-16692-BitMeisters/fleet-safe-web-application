import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';

import { FleetStore } from '../../../application/fleet.store';

@Component({
  selector: 'app-fleet-list',
  imports: [
    RouterLink,
    TranslatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './fleet-list.html',
  styleUrl: './fleet-list.css',
})
export class FleetList {
  protected readonly store = inject(FleetStore);

  protected readonly displayedColumns = ['name', 'company', 'vehicles', 'status'];
}

