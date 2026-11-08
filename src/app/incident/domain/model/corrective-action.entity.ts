import { BaseEntity } from '../../../shared/domain/model/base-entity';

/**
 * Represents an action applied to address an incident condition.
 */
export class CorrectiveAction implements BaseEntity {
  #id: string;
  #incidentId: string;
  #description: string;
  #performedBy: string;
  #performedByName: string;
  #performedAt: string;
  #evidenceUrl: string;

  constructor(props: {
    id: string;
    incidentId: string;
    description: string;
    performedBy: string;
    performedByName?: string;
    performedAt: string;
    evidenceUrl: string;
  }) {
    this.#id = props.id;
    this.#incidentId = props.incidentId;
    this.#description = props.description;
    this.#performedBy = props.performedBy;
    this.#performedByName = props.performedByName ?? '';
    this.#performedAt = props.performedAt;
    this.#evidenceUrl = props.evidenceUrl;
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

  get description(): string {
    return this.#description;
  }
  set description(value: string) {
    this.#description = value;
  }

  get performedByName(): string {
    return this.#performedByName;
  }

  get performedBy(): string {
    return this.#performedBy;
  }
  set performedBy(value: string) {
    this.#performedBy = value;
  }

  get performedAt(): string {
    return this.#performedAt;
  }
  set performedAt(value: string) {
    this.#performedAt = value;
  }

  get evidenceUrl(): string {
    return this.#evidenceUrl;
  }
  set evidenceUrl(value: string) {
    this.#evidenceUrl = value;
  }
}
