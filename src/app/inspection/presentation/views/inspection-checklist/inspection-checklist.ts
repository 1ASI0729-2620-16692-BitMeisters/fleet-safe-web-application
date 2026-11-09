import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { InspectionStore } from '../../../application/inspection.store';
import { InspectionItem } from '../../../domain/model/inspection-item.entity';
import { ItemSystem } from '../../../domain/model/item-system.enum';
import { Observation } from '../../../domain/model/observation.entity';
import { ResultValue } from '../../../domain/model/result-value.enum';
import { FindingDialog, FindingDialogData } from '../../components/finding-dialog/finding-dialog';
import { ResultSelector } from '../../components/result-selector/result-selector';
import { SystemProgress, SystemsList } from '../../components/systems-list/systems-list';
import { SystemsSheet, SystemsSheetData } from '../../components/systems-sheet/systems-sheet';
import { InspectionItemTextPipe } from '../../pipes/inspection-item-text.pipe';

const SYSTEM_ICONS: Record<ItemSystem, string> = {
  [ItemSystem.BRAKES]: 'stop_circle',
  [ItemSystem.LIGHTS]: 'lightbulb',
  [ItemSystem.TIRES_AND_SUSPENSION]: 'tire_repair',
  [ItemSystem.ENGINE_AND_FLUIDS]: 'oil_barrel',
  [ItemSystem.CABIN]: 'airline_seat_recline_normal',
  [ItemSystem.SAFETY_EQUIPMENT]: 'medical_services',
  [ItemSystem.BODY_AND_COUPLING]: 'local_shipping',
  [ItemSystem.DOCUMENTATION]: 'description',
};

interface ChecklistStep extends SystemProgress {
  items: InspectionItem[];
}

@Component({
  selector: 'app-inspection-checklist',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    ResultSelector,
    RouterLink,
    SystemsList,
    TranslatePipe,
    InspectionItemTextPipe,
  ],
  templateUrl: './inspection-checklist.html',
  styleUrl: './inspection-checklist.css',
})
export class InspectionChecklist {
  protected readonly store = inject(InspectionStore);
  private readonly router = inject(Router);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly dialog = inject(MatDialog);
  private readonly inspectionId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private readonly top = viewChild<ElementRef<HTMLElement>>('top');

  protected readonly systemIcons = SYSTEM_ICONS;

  protected readonly steps = computed<ChecklistStep[]>(() => {
    const items = this.store.activeInspectionItems();
    const inspection = this.store.currentInspection();
    return Object.values(ItemSystem)
      .map((system) => {
        const stepItems = items
          .filter((item) => item.system === system)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        const results = stepItems.map((item) => inspection?.resultFor(item.id)?.result);
        const answered = results.filter((result) => result !== undefined).length;
        return {
          system,
          items: stepItems,
          answered,
          total: stepItems.length,
          complete: answered === stepItems.length,
          hasFindings: results.some(
            (result) => result === ResultValue.OBSERVED || result === ResultValue.FAIL,
          ),
        };
      })
      .filter((step) => step.total > 0);
  });

  protected readonly answeredItems = computed(() =>
    this.steps().reduce((count, step) => count + step.answered, 0),
  );
  protected readonly totalItems = computed(() =>
    this.steps().reduce((count, step) => count + step.total, 0),
  );
  protected readonly overallProgress = computed(() =>
    this.totalItems() === 0 ? 0 : Math.round((this.answeredItems() / this.totalItems()) * 100),
  );

  protected readonly stepIndex = signal(0);
  protected readonly step = computed(() => this.steps()[this.stepIndex()]);
  protected readonly visibleStep = computed(() => {
    const step = this.step();
    return step ? [step] : [];
  });
  private readonly direction = signal<'forward' | 'backward'>('forward');
  protected readonly enterAnimation = computed(() =>
    this.direction() === 'forward' ? 'enter-from-end' : 'enter-from-start',
  );
  protected readonly isLastStep = computed(() => this.stepIndex() === this.steps().length - 1);

  private positioned = false;

  constructor() {
    effect(() => {
      const steps = this.steps();
      if (this.positioned || steps.length === 0 || !this.store.currentInspection()) return;
      this.positioned = true;
      const firstPending = steps.findIndex((step) => !step.complete);
      this.stepIndex.set(firstPending === -1 ? steps.length - 1 : firstPending);
    });

    if (this.store.currentInspection()?.id === this.inspectionId) return;
    this.store.loadInspection(this.inspectionId);
  }

  protected resultOf(item: InspectionItem): ResultValue | undefined {
    return this.store.currentInspection()?.resultFor(item.id)?.result;
  }

  protected isFinding(item: InspectionItem): boolean {
    const result = this.resultOf(item);
    return result === ResultValue.OBSERVED || result === ResultValue.FAIL;
  }

  protected observationOf(item: InspectionItem): Observation | undefined {
    return this.store.currentInspection()?.resultFor(item.id)?.observations[0];
  }

  protected openFinding(item: InspectionItem): void {
    const data: FindingDialogData = { item };
    this.dialog.open<FindingDialog, FindingDialogData, boolean>(FindingDialog, {
      data,
      width: '480px',
    });
  }

  protected answer(item: InspectionItem, result: ResultValue): void {
    this.store.answerItem(item, result);
  }

  protected previous(): void {
    this.goTo(this.stepIndex() - 1);
  }

  protected next(): void {
    if (this.isLastStep()) {
      this.router.navigate(['/inspections', this.inspectionId, 'summary']);
      return;
    }
    this.goTo(this.stepIndex() + 1);
  }

  protected openSystems(): void {
    const data: SystemsSheetData = { systems: this.steps(), current: this.stepIndex() };
    this.bottomSheet
      .open<SystemsSheet, SystemsSheetData, number>(SystemsSheet, { data })
      .afterDismissed()
      .subscribe((index) => {
        if (index !== undefined) this.goTo(index);
      });
  }

  protected goTo(index: number): void {
    this.direction.set(index < this.stepIndex() ? 'backward' : 'forward');
    this.stepIndex.set(Math.min(Math.max(index, 0), this.steps().length - 1));
    this.top()?.nativeElement.scrollIntoView?.({ block: 'start' });
  }
}
