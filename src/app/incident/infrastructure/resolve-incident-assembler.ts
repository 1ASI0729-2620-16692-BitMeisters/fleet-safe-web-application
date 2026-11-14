import { ResolveIncidentCommand } from '../domain/model/resolve-incident.command';
import { ResolveIncidentRequest } from './resolve-incident.request';
import { ResolveIncidentResource, ResolveIncidentResponse } from './resolve-incident-response';
import { Incident } from '../domain/model/incident.entity';
import { IncidentOrigin } from '../domain/model/incident-origin.enum';
import { IncidentSeverity } from '../domain/model/incident-severity.enum';
import { IncidentStatus } from '../domain/model/incident-status.enum';

/**
 * Maps incident resolution commands and endpoint payloads.
 */
export class ResolveIncidentAssembler {
  /**
   * Converts the endpoint response into an application-level resource.
   */
  toResourceFromResponse = (response: ResolveIncidentResponse): ResolveIncidentResource =>
    ({
      id: response.id,
      vehicleId: response.vehicleId,
      incidentTypeId: response.incidentTypeId,
      inspectionId: response.inspectionId,
      origin: response.origin,
      description: response.description,
      severity: response.severity,
      status: response.status,
      reportedBy: response.reportedBy,
      reportedAt: response.reportedAt,
      resolutionType: response.resolutionType,
      resolvedAt: response.resolvedAt,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    }) as ResolveIncidentResource;

  /**
   * Converts a resolve incident command into the request payload.
   */
  toRequestFromCommand = (command: ResolveIncidentCommand): ResolveIncidentRequest => ({
    status: 'RESOLVED',
    resolutionType: command.resolutionType,
    resolvedAt: command.resolvedAt,
  });

  /**
   * Converts a response resource into an Incident entity.
   */
  toEntityFromResource = (resource: ResolveIncidentResource): Incident =>
    new Incident({
      id: resource.id,
      vehicleId: resource.vehicleId,
      incidentTypeId: resource.incidentTypeId,
      inspectionId: resource.inspectionId,
      origin: resource.origin as IncidentOrigin,
      description: resource.description,
      severity: resource.severity as IncidentSeverity,
      status: resource.status as IncidentStatus,
      reportedBy: resource.reportedBy,
      reportedAt: resource.reportedAt,
      resolutionType: resource.resolutionType,
      resolvedAt: resource.resolvedAt,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });
}
