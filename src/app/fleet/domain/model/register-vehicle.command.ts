import type { VehicleDetails } from './vehicle-details.value-object';

/**
 * Captures the data required to register a new vehicle in a fleet.
 */
export class RegisterVehicleCommand {
  readonly #details: VehicleDetails;

  constructor(props: { details: VehicleDetails }) {
    this.#details = props.details;
  }

  get details(): VehicleDetails {
    return this.#details;
  }
}
