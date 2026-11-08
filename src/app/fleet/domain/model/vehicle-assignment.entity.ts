import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { localDate } from './local-date';

export class VehicleAssignment implements BaseEntity {
  #id: string;
  #vehicleId: string;
  #driverId: string;
  #assignedFrom: string;
  #assignedTo: string | null;
  #isActive: boolean;
  #createdAt?: string;

  constructor(props: {
    id: string;
    vehicleId: string;
    driverId: string;
    assignedFrom: string;
    assignedTo?: string | null;
    isActive: boolean;
    createdAt?: string;
  }) {
    this.#id = props.id;
    this.#vehicleId = props.vehicleId;
    this.#driverId = props.driverId;
    this.#assignedFrom = props.assignedFrom;
    this.#assignedTo = props.assignedTo ?? null;
    this.#isActive = props.isActive;
    this.#createdAt = props.createdAt;
  }

  /**
   * Starts an assignment that is in force from the given day until it is closed.
   */
  static start(props: {
    id: string;
    vehicleId: string;
    driverId: string;
    assignedFrom: string;
    createdAt: string;
  }): VehicleAssignment {
    return new VehicleAssignment({ ...props, assignedTo: null, isActive: true });
  }

  get id(): string {
    return this.#id;
  }

  get vehicleId(): string {
    return this.#vehicleId;
  }

  get driverId(): string {
    return this.#driverId;
  }

  get assignedFrom(): string {
    return this.#assignedFrom;
  }

  get assignedTo(): string | null {
    return this.#assignedTo;
  }

  get isActive(): boolean {
    return this.#isActive;
  }

  get createdAt(): string | undefined {
    return this.#createdAt;
  }

  /**
   * Answers whether the assignment is in force on the local day of the given date.
   *
   * @param date - Moment to check.
   */
  isActiveOn(date: Date): boolean {
    const currentDate = localDate(date);

    return (
      this.#isActive &&
      this.#assignedFrom <= currentDate &&
      (this.#assignedTo === null || currentDate <= this.#assignedTo)
    );
  }

  close(endDate: string): void {
    this.#assignedTo = endDate;
    this.#isActive = false;
  }

  /**
   * Duplicates the assignment so it can be closed without altering the one held by the store.
   */
  copy(): VehicleAssignment {
    return new VehicleAssignment({
      id: this.#id,
      vehicleId: this.#vehicleId,
      driverId: this.#driverId,
      assignedFrom: this.#assignedFrom,
      assignedTo: this.#assignedTo,
      isActive: this.#isActive,
      createdAt: this.#createdAt,
    });
  }
}
