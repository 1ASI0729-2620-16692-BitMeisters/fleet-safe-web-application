import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { InspectionStore } from '../../../application/inspection.store';
import { InspectionItem } from '../../../domain/model/inspection-item.entity';

export interface FindingDialogData {
  item: InspectionItem;
}

const ACCEPTED_PHOTOS = ['image/jpeg', 'image/png'];

@Component({
  selector: 'app-finding-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, TranslatePipe],
  templateUrl: './finding-dialog.html',
  styleUrl: './finding-dialog.css',
})
export class FindingDialog {
  protected readonly data = inject<FindingDialogData>(MAT_DIALOG_DATA);
  protected readonly store = inject(InspectionStore);
  private readonly dialogRef = inject(MatDialogRef<FindingDialog>);

  protected readonly result = computed(() => this.store.currentInspection()?.resultFor(this.data.item.id));
  protected readonly observation = computed(() => this.result()?.observations[0]);
  protected readonly description = signal('');
  protected readonly photos = signal<File[]>([]);
  protected readonly rejectedPhoto = signal(false);

  protected readonly photoMissing = computed(
    () => this.data.item.requiresEvidence && (this.observation()?.evidences.length ?? 0) + this.photos().length === 0,
  );
  protected readonly canSave = computed(
    () => (!!this.observation() || this.description().trim().length > 0) && !this.photoMissing(),
  );

  protected addPhotos(input: HTMLInputElement): void {
    const files = Array.from(input.files ?? []);
    const accepted = files.filter((file) => ACCEPTED_PHOTOS.includes(file.type));
    this.rejectedPhoto.set(accepted.length < files.length);
    this.photos.update((current) => [...current, ...accepted]);
    input.value = '';
  }

  protected removePhoto(photo: File): void {
    this.photos.update((current) => current.filter((candidate) => candidate !== photo));
  }

  protected save(): void {
    if (!this.canSave()) return;
    this.store.saveFinding(this.data.item, this.description().trim(), this.photos(), () => this.dialogRef.close(true));
  }
}
