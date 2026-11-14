import { DatePipe } from '@angular/common';
import { Component, computed, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { IncidentStore } from '../../../application/incident.store';

/**
 * Displays the incident collection with table actions.
 */
@Component({
  selector: 'app-incident-list',
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinner,
    TranslatePipe,
    MatIcon,
    MatPaginator,
    MatSort,
    MatSortHeader,
  ],
  templateUrl: './incident-list.html',
  styleUrl: './incident-list.css',
})
export class IncidentList {
  readonly store = inject(IncidentStore);
  protected router = inject(Router);

  /**
   * Columns to display in the table.
   */
  displayedColumns: string[] = [
    'vehicleId',
    'description',
    'severity',
    'status',
    'reportedAt',
    'actions',
  ];

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  /**
   * Computed data source for the table.
   */
  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.incidents());
    const sort = this.sort();
    if (sort) source.sort = sort;
    const paginator = this.paginator();
    if (paginator) source.paginator = paginator;
    return source;
  });

  /**
   * Navigates to the incident detail view.
   * @param id - The ID of the incident to view.
   */
  viewIncident(id: string) {
    this.router.navigate(['incidents', id]).then();
  }

  /**
   * Deletes an incident by ID.
   * @param id - The ID of the incident to delete.
   */
  async deleteIncident(id: string): Promise<void> {
    await this.store.deleteIncident(id);
  }

  /**
   * Navigates to the new incident form.
   */
  navigateToNew() {
    this.router.navigate(['incidents', 'new']).then();
  }
}
