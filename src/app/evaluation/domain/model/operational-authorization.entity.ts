import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { OperationalStatus } from './operational-status.enum';

export class OperationalAuthorization implements BaseEntity {
  #id: string;
  #vehicleId: string;
  #status: OperationalStatus;
  #isOverride: boolean;
  #overrideReason: string | null;
  #authorizedAt: Date;

  constructor(props: {
    id: string;
    vehicleId: string;
    status: OperationalStatus;
    isOverride: boolean;
    overrideReason: string | null;
    authorizedAt: Date;
  }) {
    this.#id = props.id;
    this.#vehicleId = props.vehicleId;
    this.#status = props.status;
    this.#isOverride = props.isOverride;
    this.#overrideReason = props.overrideReason;
    this.#authorizedAt = props.authorizedAt;
  }

  get id(): string {
    return this.#id;
  }

  set id(value: string) {
    this.#id = value;
  }

  get vehicleId(): string {
    return this.#vehicleId;
  }

  get status(): OperationalStatus {
    return this.#status;
  }

  get isOverride(): boolean {
    return this.#isOverride;
  }

  get overrideReason(): string | null {
    return this.#overrideReason;
  }

  get authorizedAt(): Date {
    return this.#authorizedAt;
  }
}
