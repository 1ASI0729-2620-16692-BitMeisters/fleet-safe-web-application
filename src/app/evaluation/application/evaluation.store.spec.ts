import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { EvaluatedVehicle } from '../domain/model/evaluated-vehicle.entity';
import { OperationalAuthorization } from '../domain/model/operational-authorization.entity';
import { OperationalStatus } from '../domain/model/operational-status.enum';
import { EvaluationApi } from '../infrastructure/evaluation-api';
import { EvaluationStore } from './evaluation.store';

const vehicles = [
  new EvaluatedVehicle({ id: 'vehicle-1', plate: 'XYZ-456', brand: 'Scania', model: 'R450' }),
  new EvaluatedVehicle({ id: 'vehicle-2', plate: 'ABC-123', brand: 'Volvo', model: 'FH 460' }),
];

const blocked = new OperationalAuthorization({
  id: 'authorization-1',
  vehicleId: 'vehicle-2',
  status: OperationalStatus.NOT_ENABLED,
  isOverride: false,
  overrideReason: null,
  authorizedAt: new Date('2026-11-07T05:44:00Z'),
});

describe('EvaluationStore', () => {
  const api = { getVehicles: vi.fn(), getCurrentAuthorizations: vi.fn() };

  function createStore(): EvaluationStore {
    TestBed.configureTestingModule({ providers: [{ provide: EvaluationApi, useValue: api }] });
    return TestBed.inject(EvaluationStore);
  }

  beforeEach(() => {
    api.getVehicles.mockReturnValue(of(vehicles));
    api.getCurrentAuthorizations.mockReturnValue(of([blocked]));
  });

  it('counts the vehicles of each status, including the ones never inspected', () => {
    const store = createStore();

    store.load();

    expect(store.counts()[OperationalStatus.NOT_ENABLED]).toBe(1);
    expect(store.counts()[OperationalStatus.NOT_INSPECTED]).toBe(1);
    expect(store.counts()[OperationalStatus.ENABLED]).toBe(0);
  });

  it('lists the vehicles by plate and filters them by status', () => {
    const store = createStore();
    store.load();

    expect(store.filteredConditions().map((condition) => condition.plate)).toEqual(['ABC-123', 'XYZ-456']);

    store.filterByStatus(OperationalStatus.NOT_ENABLED);

    expect(store.filteredConditions().map((condition) => condition.plate)).toEqual(['ABC-123']);
  });

  it('reports an error when the statuses cannot be loaded', () => {
    api.getCurrentAuthorizations.mockReturnValue(throwError(() => new Error('Failed to fetch entities')));
    const store = createStore();

    store.load();

    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);
  });
});
