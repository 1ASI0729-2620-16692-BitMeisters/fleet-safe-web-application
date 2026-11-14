import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { InspectionStore } from '../../../application/inspection.store';
import { AssignedVehicle } from '../../../domain/model/assigned-vehicle.entity';
import { Inspection } from '../../../domain/model/inspection.entity';
import { InspectionStatus } from '../../../domain/model/inspection-status.enum';
import { StartInspection } from './start-inspection';

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

function fakeStore(state: { vehicle?: AssignedVehicle; noVehicleAssigned?: boolean }) {
  return {
    assignedVehicle: signal(state.vehicle ?? null),
    noVehicleAssigned: signal(state.noVehicleAssigned ?? false),
    loading: signal(false),
    error: signal<string | null>(null),
    loadAssignedVehicle: vi.fn(),
    startInspection: vi.fn(),
  };
}

function render(store: ReturnType<typeof fakeStore>) {
  TestBed.configureTestingModule({
    imports: [StartInspection],
    providers: [
      provideRouter([]),
      provideTranslateService(),
      { provide: InspectionStore, useValue: store },
    ],
  });
  const fixture = TestBed.createComponent(StartInspection);
  fixture.detectChanges();
  return fixture;
}

describe('StartInspection', () => {
  it('shows the assigned vehicle', () => {
    const fixture = render(fakeStore({ vehicle }));

    expect(fixture.nativeElement.textContent).toContain('ABC-123');
    expect(fixture.nativeElement.textContent).toContain('Volvo FH 460');
  });

  it('tells the driver when no vehicle is assigned', () => {
    const fixture = render(fakeStore({ noVehicleAssigned: true }));

    expect(fixture.nativeElement.textContent).toContain('inspection.assignedVehicle.none');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('does not start the inspection without an odometer reading', () => {
    const store = fakeStore({ vehicle });
    const fixture = render(store);

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(store.startInspection).not.toHaveBeenCalled();
  });

  it('starts an inspection of the assigned vehicle and opens its checklist', () => {
    const store = fakeStore({ vehicle });
    const fixture = render(store);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '184320';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    const started: Inspection = store.startInspection.mock.calls[0][0];
    expect(started.vehicleId).toBe('vehicle-1');
    expect(started.driverId).toBe('driver-1');
    expect(started.odometer).toBe(184320);
    expect(started.status).toBe(InspectionStatus.IN_PROGRESS);
    expect(navigate).not.toHaveBeenCalled();

    const created = new Inspection({
      id: 'created-by-backend',
      vehicleId: started.vehicleId,
      driverId: started.driverId,
      status: started.status,
      odometer: started.odometer,
      startedAt: started.startedAt,
      completedAt: null,
      results: [],
      createdAt: started.createdAt,
      updatedAt: started.updatedAt,
    });
    store.startInspection.mock.calls[0][1](created);
    expect(navigate).toHaveBeenCalledWith(['/inspections', 'created-by-backend', 'execute']);
  });
});
