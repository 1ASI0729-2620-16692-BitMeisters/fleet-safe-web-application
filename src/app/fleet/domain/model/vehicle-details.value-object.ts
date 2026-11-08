import { VehicleType } from './vehicle-type.enum';

/** Plates follow the `ABC-123` shape: three letters or digits, a hyphen and three more. */
export const PLATE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;

export const VEHICLE_MIN_YEAR = 1950;

export const VEHICLE_TEXT_MAX_LENGTH = 60;

/**
 * Latest model year accepted: manufacturers release next year's models in advance.
 *
 * @param today - Reference date; defaults to now.
 */
export function maxVehicleYear(today: Date = new Date()): number {
  return today.getFullYear() + 1;
}

/**
 * Brings a plate to its canonical form so the same plate is always written the same way.
 *
 * @example
 * normalizePlate(' abc 123 '); // 'ABC-123'
 *
 * @param plate - Plate as typed by the user.
 * @returns The canonical plate, or the trimmed upper-cased text when it has no valid shape.
 */
export function normalizePlate(plate: string): string {
  const compact = plate.replace(/[\s-]+/g, '').toUpperCase();
  return /^[A-Z0-9]{6}$/.test(compact)
    ? `${compact.slice(0, 3)}-${compact.slice(3)}`
    : plate.trim().toUpperCase();
}

/**
 * Plain data of a {@link VehicleDetails}.
 */
export interface VehicleDetailsProps {
  fleetId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  capacity: number;
}

/**
 * Describes a vehicle independently of its identity and of its operational condition.
 *
 * @remarks
 * It groups what a supervisor can type when registering or updating a vehicle. The operational
 * condition is deliberately absent: it is derived from the vehicle's last authorization.
 */
export class VehicleDetails {
  readonly #fleetId: string;
  readonly #plate: string;
  readonly #brand: string;
  readonly #model: string;
  readonly #year: number;
  readonly #type: VehicleType;
  readonly #capacity: number;

  constructor(props: VehicleDetailsProps) {
    this.#fleetId = props.fleetId.trim();
    this.#plate = normalizePlate(props.plate);
    this.#brand = props.brand.trim();
    this.#model = props.model.trim();
    this.#year = props.year;
    this.#type = props.type;
    this.#capacity = props.capacity;
  }

  get fleetId(): string {
    return this.#fleetId;
  }

  get plate(): string {
    return this.#plate;
  }

  get brand(): string {
    return this.#brand;
  }

  get model(): string {
    return this.#model;
  }

  get year(): number {
    return this.#year;
  }

  get type(): VehicleType {
    return this.#type;
  }

  get capacity(): number {
    return this.#capacity;
  }

  /**
   * Checks the invariants a vehicle must satisfy to be registered or updated.
   *
   * @param today - Reference date used to bound the model year; defaults to now.
   */
  isValid(today: Date = new Date()): boolean {
    return (
      this.#fleetId.length > 0 &&
      PLATE_PATTERN.test(this.#plate) &&
      this.#brand.length > 0 &&
      this.#brand.length <= VEHICLE_TEXT_MAX_LENGTH &&
      this.#model.length > 0 &&
      this.#model.length <= VEHICLE_TEXT_MAX_LENGTH &&
      Number.isInteger(this.#year) &&
      this.#year >= VEHICLE_MIN_YEAR &&
      this.#year <= maxVehicleYear(today) &&
      Object.values(VehicleType).includes(this.#type) &&
      Number.isFinite(this.#capacity) &&
      this.#capacity > 0
    );
  }
}
