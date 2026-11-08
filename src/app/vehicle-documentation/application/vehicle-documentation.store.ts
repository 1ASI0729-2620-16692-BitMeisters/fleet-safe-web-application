import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin, retry, concatMap, of } from 'rxjs';
import { DocumentType } from '../domain/model/document-type.entity';
import { DocumentedVehicle } from '../domain/model/documented-vehicle.entity';
import { DocumentStatus } from '../domain/model/document-status.enum';
import {
  VehicleDocument,
  VehicleDocumentInput,
  localDate,
  validateDocument,
} from '../domain/model/vehicle-document.entity';
import { VehicleDocumentationApi } from '../infrastructure/vehicle-documentation-api';

@Injectable({ providedIn: 'root' })
export class VehicleDocumentationStore {
  private readonly vehicleDocumentationApi = inject(VehicleDocumentationApi);

  private readonly allDocumentsSignal = signal<VehicleDocument[]>([]);

  private readonly typesSignal = signal<DocumentType[]>([]);
  readonly types = this.typesSignal.asReadonly();

  private readonly vehiclesSignal = signal<DocumentedVehicle[]>([]);
  readonly vehicles = this.vehiclesSignal.asReadonly();

  private readonly vehicleIdSignal = signal<string>('');
  readonly vehicleId = this.vehicleIdSignal.asReadonly();

  readonly documents = computed(() => {
    const vehicleId = this.vehicleIdSignal();
    const today = localDate();
    return this.allDocumentsSignal().filter((document) =>
      vehicleId
        ? document.vehicleId === vehicleId
        : document.recalculateStatus(today) === DocumentStatus.EXPIRING,
    );
  });

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly savingSignal = signal<boolean>(false);
  readonly saving = this.savingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  load = (): void => {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({
      types: this.vehicleDocumentationApi.getDocumentTypes(),
      vehicles: this.vehicleDocumentationApi.getDocumentedVehicles(),
      documents: this.vehicleDocumentationApi.getVehicleDocuments(),
    })
      .pipe(retry(2))
      .subscribe({
        next: ({ types, vehicles, documents }) => {
          this.typesSignal.set(types);
          this.vehiclesSignal.set(vehicles);
          this.allDocumentsSignal.set(documents);
          this.loadingSignal.set(false);
        },
        error: (err) => {
          this.errorSignal.set(this.formatError(err, 'Failed to load the vehicle documents'));
          this.loadingSignal.set(false);
        },
      });
  };

  selectVehicle = (vehicleId: string): void => this.vehicleIdSignal.set(vehicleId);

  save = (input: VehicleDocumentInput, id: string | null, file: File | null, done: () => void): void => {
    if (this.savingSignal() || !validateDocument(input)) return;

    const now = new Date().toISOString();
    const existing = id ? this.allDocumentsSignal().find((document) => document.id === id) : null;
    const document = new VehicleDocument({
      ...input,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
    const request = (
      existing
        ? this.vehicleDocumentationApi.updateVehicleDocument(document)
        : this.vehicleDocumentationApi.registerVehicleDocument(document)
    ).pipe(
      concatMap((saved) =>
        file ? this.vehicleDocumentationApi.attachVehicleDocumentFile(saved, file) : of(saved),
      ),
    );

    this.savingSignal.set(true);
    this.errorSignal.set(null);
    request.subscribe({
      next: (saved) => {
        this.allDocumentsSignal.update((documents) =>
          existing
            ? documents.map((current) => (current.id === saved.id ? saved : current))
            : [...documents, saved],
        );
        this.savingSignal.set(false);
        done();
      },
      error: (err) => {
        this.errorSignal.set(this.formatError(err, 'Failed to save the vehicle document'));
        this.savingSignal.set(false);
      },
    });
  };

  private formatError = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  };
}
