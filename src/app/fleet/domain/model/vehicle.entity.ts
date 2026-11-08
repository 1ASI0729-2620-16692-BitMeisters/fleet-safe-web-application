import { BaseEntity } from '../../../shared/domain/model/base-entity';
import type { VehicleAssignment } from './vehicle-assignment.entity';
import {
  normalizePlate,
  VehicleDetails,
  VehicleDetailsProps,
} from './vehicle-details.value-object';
import { VehicleStatus } from './vehicle-status.enum';
import { VehicleType } from './vehicle-type.enum';

/**
 * Condition of a vehicle that has just been registered.
 *
 * @remarks
 * A vehicle is operational until an evaluation blocks or observes it. Starting it as
 * `NOT_ENABLED` would make the first assignment impossible, and without an assignment there is
 * no inspection that could ever enable it.
 */
export const INITIAL_VEHICLE_STATUS = VehicleStatus.ENABLED;

export class Vehicle implements BaseEntity {
  #id: string;
  #fleetId: string;
  #plate: string;
  #brand: string;
  #model: string;
  #year: number;
  #type: VehicleType;
  #capacity: number;
  #currentStatus: VehicleStatus;
  #createdAt?: string;
  #updatedAt?: string;

  constructor(props: {
    id: string;
    fleetId: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    type: VehicleType;
    capacity: number;
    currentStatus: VehicleStatus;
    createdAt?: string;
    updatedAt?: string;
  }) {
    this.#id = props.id;
    this.#fleetId = props.fleetId;
    this.#plate = props.plate;
    this.#brand = props.brand;
    this.#model = props.model;
    this.#year = props.year;
    this.#type = props.type;
    this.#capacity = props.capacity;
    this.#currentStatus = props.currentStatus;
    this.#createdAt = props.createdAt;
    this.#updatedAt = props.updatedAt;
  }

  /**
   * Registers a new vehicle in its initial operational condition.
   *
   * @param props - Identity, description and registration moment of the vehicle.
   */
  static register(props: { id: string; details: VehicleDetails; now: string }): Vehicle {
    return new Vehicle({
      id: props.id,
      ...Vehicle.#propsFromDetails(props.details),
      currentStatus: INITIAL_VEHICLE_STATUS,
      createdAt: props.now,
      updatedAt: props.now,
    });
  }

  static #propsFromDetails(details: VehicleDetailsProps): VehicleDetailsProps {
    return {
      fleetId: details.fleetId,
      plate: details.plate,
      brand: details.brand,
      model: details.model,
      year: details.year,
      type: details.type,
      capacity: details.capacity,
    };
  }

  get id(): string {
    return this.#id;
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

  get currentStatus(): VehicleStatus {
    return this.#currentStatus;
  }

  get createdAt(): string | undefined {
    return this.#createdAt;
  }

  get updatedAt(): string | undefined {
    return this.#updatedAt;
  }

  /**
   * Describes the vehicle without its identity or condition, e.g. to edit it in a form.
   */
  toDetails(): VehicleDetails {
    return new VehicleDetails(Vehicle.#propsFromDetails(this));
  }

  /**
   * Answers whether the vehicle carries the given plate, ignoring case and separators.
   *
   * @param plate - Plate to compare.
   */
  hasPlate(plate: string): boolean {
    return normalizePlate(this.#plate) === normalizePlate(plate);
  }

  /**
   * Produces the same vehicle with new details.
   *
   * @remarks
   * Identity, creation date and operational condition are kept: the condition can only change
   * through {@link applyAuthorizationResult}.
   *
   * @param details - New description of the vehicle.
   * @param updatedAt - Moment of the update.
   */
  withDetails(details: VehicleDetails, updatedAt: string): Vehicle {
    return new Vehicle({
      id: this.#id,
      ...Vehicle.#propsFromDetails(details),
      currentStatus: this.#currentStatus,
      createdAt: this.#createdAt,
      updatedAt,
    });
  }

  applyAuthorizationResult(status: VehicleStatus): void {
    this.#currentStatus = status;
  }

  isOperational(): boolean {
    return this.#currentStatus === VehicleStatus.ENABLED;
  }

  getActiveAssignment(
    assignments: readonly VehicleAssignment[],
    date: Date = new Date(),
  ): VehicleAssignment | null {
    return (
      assignments.find(
        (assignment) => assignment.vehicleId === this.#id && assignment.isActiveOn(date),
      ) ?? null
    );
  }
}
