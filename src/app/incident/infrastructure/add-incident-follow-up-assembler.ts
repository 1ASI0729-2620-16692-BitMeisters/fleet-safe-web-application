import { AddIncidentFollowUpCommand } from '../domain/model/add-incident-follow-up.command';
import { AddIncidentFollowUpRequest } from './add-incident-follow-up.request';
import {
  AddIncidentFollowUpResource,
  AddIncidentFollowUpResponse,
} from './add-incident-follow-up-response';
import { IncidentFollowUp } from '../domain/model/incident-follow-up.entity';

/**
 * Maps incident follow-up commands and endpoint payloads.
 */
export class AddIncidentFollowUpAssembler {
  /**
   * Converts the endpoint response into an application-level resource.
   */
  toResourceFromResponse = (response: AddIncidentFollowUpResponse): AddIncidentFollowUpResource =>
    ({
      id: response.id,
      incidentId: response.incidentId,
      note: response.note,
      createdBy: response.createdBy,
      createdByName: response.createdByName,
      createdAt: response.createdAt,
    }) as AddIncidentFollowUpResource;

  /**
   * Converts an add incident follow-up command into the request payload.
   */
  toRequestFromCommand = (command: AddIncidentFollowUpCommand): AddIncidentFollowUpRequest =>
    ({
      incidentId: command.incidentId,
      note: command.note,
      createdBy: command.createdBy,
      createdAt: command.createdAt,
    }) as AddIncidentFollowUpRequest;

  /**
   * Converts a response resource into an IncidentFollowUp entity.
   */
  toEntityFromResource = (resource: AddIncidentFollowUpResource): IncidentFollowUp =>
    new IncidentFollowUp({
      id: resource.id,
      incidentId: resource.incidentId,
      note: resource.note,
      createdBy: resource.createdBy,
      createdByName: resource.createdByName ?? '',
      createdAt: resource.createdAt,
    });
}
