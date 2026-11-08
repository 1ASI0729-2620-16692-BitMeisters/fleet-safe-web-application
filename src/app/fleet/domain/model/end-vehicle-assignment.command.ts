/**
 * Captures the data required to end an active vehicle assignment.
 */
export class EndVehicleAssignmentCommand {
  readonly #assignmentId: string;

  constructor(props: { assignmentId: string }) {
    this.#assignmentId = props.assignmentId;
  }

  get assignmentId(): string {
    return this.#assignmentId;
  }
}
