import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents a supervisor follow-up note on an incident.
 */
export class IncidentFollowUp implements BaseEntity {
  #id: string;
  #incidentId: string;
  #note: string;
  #createdBy: string;
  #createdByName: string;
  #createdAt: string;

  constructor(props: {
    id: string;
    incidentId: string;
    note: string;
    createdBy: string;
    createdByName?: string;
    createdAt: string;
  }) {
    this.#id = props.id;
    this.#incidentId = props.incidentId;
    this.#note = props.note;
    this.#createdBy = props.createdBy;
    this.#createdByName = props.createdByName ?? '';
    this.#createdAt = props.createdAt;
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

  get note(): string {
    return this.#note;
  }
  set note(value: string) {
    this.#note = value;
  }

  get createdByName(): string {
    return this.#createdByName;
  }

  get createdBy(): string {
    return this.#createdBy;
  }
  set createdBy(value: string) {
    this.#createdBy = value;
  }

  get createdAt(): string {
    return this.#createdAt;
  }
  set createdAt(value: string) {
    this.#createdAt = value;
  }
}
