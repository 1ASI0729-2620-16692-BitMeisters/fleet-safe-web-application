import { BaseEntity } from '../../../shared/domain/model/base-entity';
import { IncidentOrigin } from './incident-origin.enum';
import { IncidentSeverity } from './incident-severity.enum';
import { IncidentStatus } from './incident-status.enum';
import { CorrectiveAction } from './corrective-action.entity';
import { Repair } from './repair.entity';
import { IncidentFollowUp } from './incident-follow-up.entity';

/**
 * Represents the aggregate root for the Incident Management context.
 */
export class Incident implements BaseEntity {
  #id: string;
  #vehicleId: string;
  #incidentTypeId: string;
  #inspectionId: string | null;
  #origin: IncidentOrigin;
  #description: string;
  #severity: IncidentSeverity;
  #status: IncidentStatus;
  #reportedBy: string;
  #reportedByName: string;
  #reportedAt: string;
  #resolutionType: string;
  #resolvedAt: string;
  #createdAt: string;
  #updatedAt: string;
  #correctiveActions: CorrectiveAction[];
  #repairs: Repair[];
  #followUps: IncidentFollowUp[];

  constructor(props: {
    id: string;
    vehicleId: string;
    incidentTypeId: string;
    inspectionId?: string | null;
    origin: IncidentOrigin;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    reportedBy: string;
    reportedByName?: string;
    reportedAt: string;
    resolutionType?: string;
    resolvedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    correctiveActions?: CorrectiveAction[];
    repairs?: Repair[];
    followUps?: IncidentFollowUp[];
  }) {
    this.#id = props.id;
    this.#vehicleId = props.vehicleId;
    this.#incidentTypeId = props.incidentTypeId;
    this.#inspectionId = props.inspectionId ?? null;
    this.#origin = props.origin;
    this.#description = props.description;
    this.#severity = props.severity;
    this.#status = props.status;
    this.#reportedBy = props.reportedBy;
    this.#reportedByName = props.reportedByName ?? '';
    this.#reportedAt = props.reportedAt;
    this.#resolutionType = props.resolutionType ?? '';
    this.#resolvedAt = props.resolvedAt ?? '';
    this.#createdAt = props.createdAt ?? '';
    this.#updatedAt = props.updatedAt ?? '';
    this.#correctiveActions = props.correctiveActions ?? [];
    this.#repairs = props.repairs ?? [];
    this.#followUps = props.followUps ?? [];
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
  set vehicleId(value: string) {
    this.#vehicleId = value;
  }

  get incidentTypeId(): string {
    return this.#incidentTypeId;
  }
  set incidentTypeId(value: string) {
    this.#incidentTypeId = value;
  }

  get inspectionId(): string | null {
    return this.#inspectionId;
  }
  set inspectionId(value: string | null) {
    this.#inspectionId = value;
  }

  get origin(): IncidentOrigin {
    return this.#origin;
  }
  set origin(value: IncidentOrigin) {
    this.#origin = value;
  }

  get description(): string {
    return this.#description;
  }
  set description(value: string) {
    this.#description = value;
  }

  get severity(): IncidentSeverity {
    return this.#severity;
  }
  set severity(value: IncidentSeverity) {
    this.#severity = value;
  }

  get status(): IncidentStatus {
    return this.#status;
  }
  set status(value: IncidentStatus) {
    this.#status = value;
  }

  get reportedByName(): string {
    return this.#reportedByName;
  }

  get reportedBy(): string {
    return this.#reportedBy;
  }
  set reportedBy(value: string) {
    this.#reportedBy = value;
  }

  get reportedAt(): string {
    return this.#reportedAt;
  }
  set reportedAt(value: string) {
    this.#reportedAt = value;
  }

  get resolutionType(): string {
    return this.#resolutionType;
  }
  set resolutionType(value: string) {
    this.#resolutionType = value;
  }

  get resolvedAt(): string {
    return this.#resolvedAt;
  }
  set resolvedAt(value: string) {
    this.#resolvedAt = value;
  }

  get createdAt(): string {
    return this.#createdAt;
  }
  set createdAt(value: string) {
    this.#createdAt = value;
  }

  get updatedAt(): string {
    return this.#updatedAt;
  }
  set updatedAt(value: string) {
    this.#updatedAt = value;
  }

  get correctiveActions(): CorrectiveAction[] {
    return this.#correctiveActions;
  }
  set correctiveActions(value: CorrectiveAction[]) {
    this.#correctiveActions = value;
  }

  get repairs(): Repair[] {
    return this.#repairs;
  }
  set repairs(value: Repair[]) {
    this.#repairs = value;
  }

  get followUps(): IncidentFollowUp[] {
    return this.#followUps;
  }
  set followUps(value: IncidentFollowUp[]) {
    this.#followUps = value;
  }

  addCorrectiveAction(action: CorrectiveAction): void {
    this.#correctiveActions.push(action);
  }

  addFollowUp(followUp: IncidentFollowUp): void {
    this.#followUps.push(followUp);
  }

  resolve(resolutionType: string, moment: string): void {
    this.#resolutionType = resolutionType;
    this.#resolvedAt = moment;
    this.#status = IncidentStatus.RESOLVED;
  }

  isCritical(): boolean {
    return this.#severity === IncidentSeverity.CRITICAL;
  }

  comesFromInspection(): boolean {
    return this.#origin === IncidentOrigin.INSPECTION;
  }
}
