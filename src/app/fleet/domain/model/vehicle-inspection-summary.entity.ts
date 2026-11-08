import { BaseEntity } from '../../../shared/domain/model/base-entity';
/**
 * Line of a vehicle's inspection history, as Fleet Management shows it in the vehicle detail (US14).
 *
 * @remarks
 * It is a read-only summary. The inspection itself belongs to the Pre-Operational Inspection
 * context, so only what the history needs is kept and the vehicle and driver are referenced by
 * identifier. The status is the text published by that context ('IN_PROGRESS', 'COMPLETED').
 */
export class VehicleInspectionSummary implements BaseEntity {
  readonly #id: string;
  readonly #vehicleId: string;
  readonly #driverId: string;
  readonly #status: string;
  readonly #odometer: number;
  readonly #startedAt: string;

  constructor(props: {
    id: string;
    vehicleId: string;
    driverId: string;
    status: string;
    odometer: number;
    startedAt: string;
  }) {
    this.#id = props.id;
    this.#vehicleId = props.vehicleId;
    this.#driverId = props.driverId;
    this.#status = props.status;
    this.#odometer = props.odometer;
    this.#startedAt = props.startedAt;
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

  get status(): string {
    return this.#status;
  }

  get odometer(): number {
    return this.#odometer;
  }

  get startedAt(): string {
    return this.#startedAt;
  }
}
