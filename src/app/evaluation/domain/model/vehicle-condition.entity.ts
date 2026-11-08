import { EvaluatedVehicle } from './evaluated-vehicle.entity';
import { OperationalAuthorization } from './operational-authorization.entity';
import { OperationalStatus } from './operational-status.enum';

export class VehicleCondition {
  #vehicle: EvaluatedVehicle;
  #authorization: OperationalAuthorization | null;

  constructor(vehicle: EvaluatedVehicle, authorization: OperationalAuthorization | null) {
    this.#vehicle = vehicle;
    this.#authorization = authorization;
  }

  static fromVehicles(
    vehicles: EvaluatedVehicle[],
    authorizations: OperationalAuthorization[],
  ): VehicleCondition[] {
    const current = new Map(authorizations.map((authorization) => [authorization.vehicleId, authorization]));
    return vehicles.map((vehicle) => new VehicleCondition(vehicle, current.get(vehicle.id) ?? null));
  }

  get vehicleId(): string {
    return this.#vehicle.id;
  }

  get plate(): string {
    return this.#vehicle.plate;
  }

  get description(): string {
    return this.#vehicle.description;
  }

  get status(): OperationalStatus {
    return this.#authorization?.status ?? OperationalStatus.NOT_INSPECTED;
  }

  get evaluatedAt(): Date | null {
    return this.#authorization?.authorizedAt ?? null;
  }

  get isOverride(): boolean {
    return this.#authorization?.isOverride ?? false;
  }
}
