import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Incident } from '../domain/model/incident.entity';
import { CorrectiveAction } from '../domain/model/corrective-action.entity';
import { Repair } from '../domain/model/repair.entity';
import { IncidentFollowUp } from '../domain/model/incident-follow-up.entity';
import { IncidentOrigin } from '../domain/model/incident-origin.enum';
import { IncidentSeverity } from '../domain/model/incident-severity.enum';
import { IncidentStatus } from '../domain/model/incident-status.enum';
import { RepairStatus } from '../domain/model/repair-status.enum';
import {
  IncidentResource,
  IncidentsResponse,
  CorrectiveActionResource,
  RepairResource,
  IncidentFollowUpResource,
} from './incidents-response';

/**
 * Maps incident entities to and from API resources.
 */
export class IncidentAssembler implements BaseAssembler<
  Incident,
  IncidentResource,
  IncidentsResponse
> {
  /**
   * Converts an IncidentsResponse to an array of Incident entities.
   * @param response - The API response containing incidents.
   * @returns An array of Incident entities.
   */
  toEntitiesFromResponse = (response: IncidentsResponse): Incident[] =>
    response.incidents.map((resource) => this.toEntityFromResource(resource));

  /**
   * Converts an IncidentResource to an Incident entity.
   * @param resource - The resource to convert.
   * @returns The converted Incident entity.
   */
  toEntityFromResource = (resource: IncidentResource): Incident =>
    new Incident({
      id: resource.id,
      vehicleId: resource.vehicleId,
      incidentTypeId: resource.incidentTypeId,
      inspectionId: resource.inspectionId ?? null,
      origin: resource.origin as IncidentOrigin,
      description: resource.description,
      severity: resource.severity as IncidentSeverity,
      status: resource.status as IncidentStatus,
      reportedBy: resource.reportedBy,
      reportedByName: resource.reportedByName ?? '',
      reportedAt: resource.reportedAt,
      resolutionType: resource.resolutionType ?? '',
      resolvedAt: resource.resolvedAt ?? '',
      createdAt: resource.createdAt ?? '',
      updatedAt: resource.updatedAt ?? '',
      correctiveActions: (resource.correctiveActions ?? []).map((a) =>
        this.toCorrectiveActionFromResource(a),
      ),
      repairs: (resource.repairs ?? []).map((r) => this.toRepairFromResource(r)),
      followUps: (resource.followUps ?? []).map((f) => this.toIncidentFollowUpFromResource(f)),
    });

  /**
   * Converts an Incident entity to an IncidentResource.
   * @param entity - The entity to convert.
   * @returns The converted IncidentResource.
   */
  toResourceFromEntity = (entity: Incident): IncidentResource =>
    ({
      id: entity.id,
      vehicleId: entity.vehicleId,
      incidentTypeId: entity.incidentTypeId,
      inspectionId: entity.inspectionId,
      origin: entity.origin,
      description: entity.description,
      severity: entity.severity,
      status: entity.status,
      reportedBy: entity.reportedBy,
      reportedByName: entity.reportedByName,
      reportedAt: entity.reportedAt,
      resolutionType: entity.resolutionType,
      resolvedAt: entity.resolvedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      correctiveActions: entity.correctiveActions.map((a) =>
        this.toCorrectiveActionResourceFromEntity(a),
      ),
      repairs: entity.repairs.map((r) => this.toRepairResourceFromEntity(r)),
      followUps: entity.followUps.map((f) => this.toIncidentFollowUpResourceFromEntity(f)),
    }) as IncidentResource;

  /**
   * Converts a CorrectiveActionResource to a CorrectiveAction entity.
   */
  private toCorrectiveActionFromResource = (resource: CorrectiveActionResource): CorrectiveAction =>
    new CorrectiveAction({
      id: resource.id,
      incidentId: resource.incidentId,
      description: resource.description,
      performedBy: resource.performedBy,
      performedByName: resource.performedByName ?? '',
      performedAt: resource.performedAt,
      evidenceUrl: resource.evidenceUrl,
    });

  /**
   * Converts a CorrectiveAction entity to a CorrectiveActionResource.
   */
  private toCorrectiveActionResourceFromEntity = (
    entity: CorrectiveAction,
  ): CorrectiveActionResource =>
    ({
      id: entity.id,
      incidentId: entity.incidentId,
      description: entity.description,
      performedBy: entity.performedBy,
      performedByName: entity.performedByName,
      performedAt: entity.performedAt,
      evidenceUrl: entity.evidenceUrl,
    }) as CorrectiveActionResource;

  /**
   * Converts a RepairResource to a Repair entity.
   */
  private toRepairFromResource = (resource: RepairResource): Repair =>
    new Repair({
      id: resource.id,
      incidentId: resource.incidentId,
      workshop: resource.workshop,
      cost: resource.cost,
      startedAt: resource.startedAt,
      finishedAt: resource.finishedAt,
      status: resource.status as RepairStatus,
    });

  /**
   * Converts a Repair entity to a RepairResource.
   */
  private toRepairResourceFromEntity = (entity: Repair): RepairResource =>
    ({
      id: entity.id,
      incidentId: entity.incidentId,
      workshop: entity.workshop,
      cost: entity.cost,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      status: entity.status,
    }) as RepairResource;

  /**
   * Converts an IncidentFollowUpResource to an IncidentFollowUp entity.
   */
  private toIncidentFollowUpFromResource = (resource: IncidentFollowUpResource): IncidentFollowUp =>
    new IncidentFollowUp({
      id: resource.id,
      incidentId: resource.incidentId,
      note: resource.note,
      createdBy: resource.createdBy,
      createdByName: resource.createdByName ?? '',
      createdAt: resource.createdAt,
    });

  /**
   * Converts an IncidentFollowUp entity to an IncidentFollowUpResource.
   */
  private toIncidentFollowUpResourceFromEntity = (
    entity: IncidentFollowUp,
  ): IncidentFollowUpResource =>
    ({
      id: entity.id,
      incidentId: entity.incidentId,
      note: entity.note,
      createdBy: entity.createdBy,
      createdByName: entity.createdByName,
      createdAt: entity.createdAt,
    }) as IncidentFollowUpResource;
}
