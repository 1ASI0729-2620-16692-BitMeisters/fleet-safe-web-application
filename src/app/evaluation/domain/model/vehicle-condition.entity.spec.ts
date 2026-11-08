import { EvaluatedVehicle } from './evaluated-vehicle.entity';
import { OperationalAuthorization } from './operational-authorization.entity';
import { OperationalStatus } from './operational-status.enum';
import { VehicleCondition } from './vehicle-condition.entity';

const vehicle = (id: string, plate: string) => new EvaluatedVehicle({ id, plate, brand: 'Volvo', model: 'FH 460' });

describe('VehicleCondition', () => {
  const blocked = new OperationalAuthorization({
    id: 'authorization-1',
    vehicleId: 'vehicle-1',
    status: OperationalStatus.NOT_ENABLED,
    isOverride: false,
    overrideReason: null,
    authorizedAt: new Date('2026-11-07T05:44:00Z'),
  });

  it('takes the status of the current authorization of the vehicle', () => {
    const [condition] = VehicleCondition.fromVehicles([vehicle('vehicle-1', 'ABC-123')], [blocked]);

    expect(condition.status).toBe(OperationalStatus.NOT_ENABLED);
    expect(condition.evaluatedAt).toEqual(new Date('2026-11-07T05:44:00Z'));
    expect(condition.description).toBe('Volvo FH 460');
  });

  it('marks a vehicle without authorization as not inspected', () => {
    const [condition] = VehicleCondition.fromVehicles([vehicle('vehicle-2', 'XYZ-456')], [blocked]);

    expect(condition.status).toBe(OperationalStatus.NOT_INSPECTED);
    expect(condition.evaluatedAt).toBeNull();
  });
});
