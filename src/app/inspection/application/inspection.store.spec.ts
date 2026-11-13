import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Notifier } from '../../shared/application/notifier';
import { Observation } from '../domain/model/observation.entity';
import { AssignedVehicle } from '../domain/model/assigned-vehicle.entity';
import { InspectionItem } from '../domain/model/inspection-item.entity';
import { Inspection } from '../domain/model/inspection.entity';
import { InspectionStatus } from '../domain/model/inspection-status.enum';
import { ItemCategory } from '../domain/model/item-category.enum';
import { ItemSystem } from '../domain/model/item-system.enum';
import { ResultValue } from '../domain/model/result-value.enum';
import { InspectionApi } from '../infrastructure/inspection-api';
import { InspectionResultEntry } from '../domain/model/inspection-result-entry.entity';
import { InspectionStore } from './inspection.store';

const vehicle = new AssignedVehicle({
  id: 'assignment-1',
  vehicleId: 'vehicle-1',
  driverId: 'driver-1',
  plate: 'ABC-123',
  brand: 'Volvo',
  model: 'FH 460',
  type: 'Tractor unit',
  assignedFrom: new Date('2026-09-01'),
});

const brakes = new InspectionItem({
  id: 'brakes',
  code: 'SAF-01',
  name: 'Brake system',
  description: '',
  category: ItemCategory.SAFETY_COMPONENT,
  system: ItemSystem.BRAKES,
  isSafetyComponent: true,
  requiresEvidence: true,
  displayOrder: 1,
  isActive: true,
  createdAt: new Date('2026-09-01T14:00:00Z'),
  updatedAt: new Date('2026-09-01T14:00:00Z'),
});

function inspectionProps() {
  return {
    id: 'inspection-1',
    vehicleId: 'vehicle-1',
    driverId: 'driver-1',
    status: InspectionStatus.IN_PROGRESS,
    odometer: 184320,
    startedAt: new Date('2026-09-15T10:38:00Z'),
    completedAt: null,
    results: [],
    createdAt: new Date('2026-09-15T10:38:00Z'),
    updatedAt: new Date('2026-09-15T10:38:00Z'),
  };
}

function anInspection(): Inspection {
  return new Inspection(inspectionProps());
}

function aResult(id: string, result: ResultValue): InspectionResultEntry {
  return new InspectionResultEntry({
    id,
    inspectionItemId: 'brakes',
    itemName: 'Brake system',
    itemCategory: ItemCategory.SAFETY_COMPONENT,
    result,
    createdAt: new Date('2026-09-15T10:40:00Z'),
    observations: [],
  });
}

describe('InspectionStore', () => {
  const api = {
    getInspectionItems: vi.fn(),
    getAssignedVehicle: vi.fn(),
    getInspection: vi.fn(),
    createInspection: vi.fn(),
    registerResult: vi.fn(),
    updateResult: vi.fn(),
    addObservation: vi.fn(),
    attachEvidence: vi.fn(),
    completeInspection: vi.fn(),
    getVehicleStatus: vi.fn(),
  };
  const notifier = { success: vi.fn() };

  function createStore(): InspectionStore {
    TestBed.configureTestingModule({
      providers: [
        { provide: InspectionApi, useValue: api },
        { provide: Notifier, useValue: notifier },
      ],
    });
    return TestBed.inject(InspectionStore);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    api.getInspectionItems.mockReturnValue(of([brakes]));
    api.getAssignedVehicle.mockReturnValue(of(vehicle));
  });

  it('loads the catalog and the assigned vehicle when it is created', () => {
    const store = createStore();

    expect(store.activeInspectionItems()).toEqual([brakes]);
    expect(store.assignedVehicle()).toBe(vehicle);
    expect(store.loading()).toBe(false);
  });

  it('marks that the driver has no vehicle when the assignment is not found', () => {
    api.getAssignedVehicle.mockReturnValue(
      throwError(() => new Error('Failed to fetch the assigned vehicle: Resource not found')),
    );
    const store = createStore();

    expect(store.noVehicleAssigned()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('keeps the started inspection and notifies the success', () => {
    const inspection = anInspection();
    api.createInspection.mockReturnValue(of(inspection));
    const store = createStore();

    store.startInspection(inspection);

    expect(store.currentInspection()).toBe(inspection);
    expect(notifier.success).toHaveBeenCalledWith('inspection.notifications.started');
  });

  it('forgets the inspection and keeps the error when starting fails', () => {
    api.createInspection.mockReturnValue(
      throwError(() => new Error('Failed to create entity: 500')),
    );
    const store = createStore();

    store.startInspection(anInspection());

    expect(store.currentInspection()).toBeNull();
    expect(store.error()).toBe('Failed to create entity: 500');
    expect(notifier.success).not.toHaveBeenCalled();
  });

  it('registers the first answer of an item and keeps the result the backend returns', () => {
    api.getInspection.mockReturnValue(of(anInspection()));
    api.registerResult.mockReturnValue(of(aResult('result-1', ResultValue.FAIL)));
    const store = createStore();
    store.loadInspection('inspection-1');

    store.answerItem(brakes, ResultValue.FAIL);

    expect(api.registerResult).toHaveBeenCalledWith('inspection-1', 'brakes', ResultValue.FAIL);
    expect(store.currentInspection()?.resultFor('brakes')?.id).toBe('result-1');
    expect(store.savingItemId()).toBeNull();
  });

  it('changes an answer that was already registered', () => {
    api.getInspection.mockReturnValue(of(anInspection().withResult(aResult('result-1', ResultValue.FAIL))));
    api.updateResult.mockReturnValue(of(aResult('result-1', ResultValue.OK)));
    const store = createStore();
    store.loadInspection('inspection-1');

    store.answerItem(brakes, ResultValue.OK);

    expect(api.updateResult).toHaveBeenCalledWith('inspection-1', 'result-1', ResultValue.OK);
    expect(store.currentInspection()?.resultFor('brakes')?.result).toBe(ResultValue.OK);
  });

  it('keeps the previous answer and the error when saving fails', () => {
    api.getInspection.mockReturnValue(of(anInspection()));
    api.registerResult.mockReturnValue(throwError(() => new Error('Failed to save the answer: 409')));
    const store = createStore();
    store.loadInspection('inspection-1');

    store.answerItem(brakes, ResultValue.OK);

    expect(store.currentInspection()?.resultFor('brakes')).toBeUndefined();
    expect(store.error()).toBe('Failed to save the answer: 409');
  });

  it('does not save an item again with the same answer', () => {
    api.getInspection.mockReturnValue(of(anInspection().withResult(aResult('result-1', ResultValue.OK))));
    const store = createStore();
    store.loadInspection('inspection-1');

    store.answerItem(brakes, ResultValue.OK);

    expect(api.registerResult).not.toHaveBeenCalled();
    expect(api.updateResult).not.toHaveBeenCalled();
  });
  it('saves the observation of a finding and each of its photos, then reloads the inspection', () => {
    const answered = anInspection().withResult(aResult('result-1', ResultValue.FAIL));
    api.getInspection.mockReturnValue(of(answered));
    api.addObservation.mockReturnValue(of(new Observation({ id: 'observation-1', description: 'Soft pedal', createdBy: 'driver-1', createdAt: new Date(), evidences: [] })));
    api.attachEvidence.mockReturnValue(of({}));
    const store = createStore();
    store.loadInspection('inspection-1');
    const done = vi.fn();
    const photos = [new File(['a'], 'front.jpg', { type: 'image/jpeg' }), new File(['b'], 'side.png', { type: 'image/png' })];

    store.saveFinding(brakes, 'Soft pedal', photos, done);

    expect(api.addObservation).toHaveBeenCalledWith('inspection-1', 'result-1', 'Soft pedal');
    expect(api.attachEvidence).toHaveBeenCalledTimes(2);
    expect(api.attachEvidence).toHaveBeenLastCalledWith('inspection-1', 'observation-1', photos[1]);
    expect(done).toHaveBeenCalled();
    expect(store.savingFinding()).toBe(false);
  });

  it('submits the inspection and hands over the completed one', () => {
    api.getInspection.mockReturnValue(of(anInspection()));
    const completed = new Inspection({ ...inspectionProps(), status: InspectionStatus.COMPLETED, completedAt: new Date() });
    api.completeInspection.mockReturnValue(of(completed));
    const store = createStore();
    store.loadInspection('inspection-1');
    const done = vi.fn();

    store.submitInspection(done);

    expect(api.completeInspection).toHaveBeenCalledWith('inspection-1');
    expect(done).toHaveBeenCalledWith(completed);
    expect(store.currentInspection()?.status).toBe(InspectionStatus.COMPLETED);
  });
});
