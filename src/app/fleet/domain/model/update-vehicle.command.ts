import type { VehicleDetails } from './vehicle-details.value-object';

/**
 * Captures the data required to update an existing vehicle.
 */
export class UpdateVehicleCommand {
  readonly #vehicleId: string;
  readonly #details: VehicleDetails;

  constructor(props: { vehicleId: string; details: VehicleDetails }) {
    this.#vehicleId = props.vehicleId;
    this.#details = props.details;
  }

  get vehicleId(): string {
    return this.#vehicleId;
  }

  get details(): VehicleDetails {
    return this.#details;
  }
}
