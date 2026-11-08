import { BaseEntity } from '../../../shared/domain/model/base-entity';

export class IncidentInspection implements BaseEntity {
  #id: string;
  #vehicleId: string;
  #status: string;
  #startedAt: string;

  constructor(props: { id: string; vehicleId: string; status: string; startedAt: string }) {
    this.#id = props.id;
    this.#vehicleId = props.vehicleId;
    this.#status = props.status;
    this.#startedAt = props.startedAt;
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

  get status(): string {
    return this.#status;
  }

  get startedAt(): string {
    return this.#startedAt;
  }
}
