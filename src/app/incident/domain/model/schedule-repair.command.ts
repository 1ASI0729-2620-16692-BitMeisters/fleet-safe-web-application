/**
 * Captures the data required to schedule a repair for an incident.
 */
export class ScheduleRepairCommand {
  #incidentId: string;
  #workshop: string;
  #cost: number;
  #startedAt: string;
  #finishedAt: string | null;

  /**
   * Creates a new command instance.
   * @param props - Repair scheduling values.
   */
  constructor(props: {
    incidentId: string;
    workshop: string;
    cost: number;
    startedAt: string;
    finishedAt: string | null;
  }) {
    this.#incidentId = props.incidentId;
    this.#workshop = props.workshop;
    this.#cost = props.cost;
    this.#startedAt = props.startedAt;
    this.#finishedAt = props.finishedAt;
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
}
