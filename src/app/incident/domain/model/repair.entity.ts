import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { RepairStatus } from './repair-status.enum';

/**
 * Represents a repair task associated with an incident.
 */
export class Repair implements BaseEntity {
  #id: string;
  #incidentId: string;
  #workshop: string;
  #cost: number;
  #startedAt: string;
  #finishedAt: string | null;
  #status: RepairStatus;

  constructor(props: {
    id: string;
    incidentId: string;
    workshop: string;
    cost: number;
    startedAt: string;
    finishedAt: string | null;
    status: RepairStatus;
  }) {
    this.#id = props.id;
    this.#incidentId = props.incidentId;
    this.#workshop = props.workshop;
    this.#cost = props.cost;
    this.#startedAt = props.startedAt;
    this.#finishedAt = props.finishedAt;
    this.#status = props.status;
  }

  get id(): string {
    return this.#id;
  }
  set id(value: string) {
    this.#id = value;
  }

  get incidentId(): string {
    return this.#incidentId;
  }
  set incidentId(value: string) {
    this.#incidentId = value;
  }

  get workshop(): string {
    return this.#workshop;
  }
  set workshop(value: string) {
    this.#workshop = value;
  }

  get cost(): number {
    return this.#cost;
  }
  set cost(value: number) {
    this.#cost = value;
  }

  get startedAt(): string {
    return this.#startedAt;
  }
  set startedAt(value: string) {
    this.#startedAt = value;
  }

  get finishedAt(): string | null {
    return this.#finishedAt;
  }

  set finishedAt(value: string | null) {
    this.#finishedAt = value;
  }

  get status(): RepairStatus {
    return this.#status;
  }
  set status(value: RepairStatus) {
    this.#status = value;
  }

  isFinished(): boolean {
    return this.#status === RepairStatus.COMPLETED;
  }

  durationInDays(): number {
    if (!this.#startedAt || !this.#finishedAt) return 0;
    const start = new Date(this.#startedAt).getTime();
    const end = new Date(this.#finishedAt).getTime();
    return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  }
}
