import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { Incident } from '../../../domain/model/incident.entity';
import { IncidentStore } from '../../../application/incident.store';

/**
 * Displays a compact summary of an incident.
 */
@Component({
  selector: 'app-incident-summary-card',
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, TranslatePipe],
  templateUrl: './incident-summary-card.html',
  styleUrl: './incident-summary-card.css',
})
export class IncidentSummaryCard {
  /**
   * The incident to display.
   */
  incident = input.required<Incident>();

  plateOf = inject(IncidentStore).plateOf;

  /**
   * Returns the CSS class for the severity badge.
   */
  severityClass = (): string => `severity-${this.incident().severity.toLowerCase()}`;

  /**
   * Returns the CSS class for the status badge.
   */
  statusClass = (): string => `status-${this.incident().status.toLowerCase()}`;
}
