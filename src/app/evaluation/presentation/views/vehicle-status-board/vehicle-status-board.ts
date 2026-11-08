import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { EvaluationStore, StatusFilter } from '../../../application/evaluation.store';
import { OperationalStatus } from '../../../domain/model/operational-status.enum';

@Component({
  selector: 'app-vehicle-status-board',
  imports: [DatePipe, MatButtonModule, MatFormFieldModule, MatSelectModule, TranslatePipe],
  templateUrl: './vehicle-status-board.html',
  styleUrl: './vehicle-status-board.css',
})
export class VehicleStatusBoard implements OnInit {
  protected readonly store = inject(EvaluationStore);
  protected readonly statuses = Object.values(OperationalStatus);
  protected readonly filters: StatusFilter[] = ['ALL', ...this.statuses];

  ngOnInit(): void {
    this.store.load();
  }
}
