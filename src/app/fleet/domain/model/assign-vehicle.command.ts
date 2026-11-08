/**
 * Captures the data required to assign a vehicle to a driver.
 */
export class AssignVehicleCommand {
  readonly #vehicleId: string;
  readonly #driverId: string;

  constructor(props: { vehicleId: string; driverId: string }) {
    this.#vehicleId = props.vehicleId;
    this.#driverId = props.driverId;
  }

  get vehicleId(): string {
    return this.#vehicleId;
  }

  get driverId(): string {
    return this.#driverId;
  }
}
