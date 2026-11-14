import { CompleteRepairCommand } from '../domain/model/complete-repair.command';
import { CompleteRepairRequest } from './complete-repair.request';
import { CompleteRepairResource, CompleteRepairResponse } from './complete-repair-response';
import { Repair } from '../domain/model/repair.entity';
import { RepairStatus } from '../domain/model/repair-status.enum';

/**
 * Maps repair completion commands and endpoint payloads.
 */
export class CompleteRepairAssembler {
  /**
   * Converts the endpoint response into an application-level resource.
   */
  toResourceFromResponse = (response: CompleteRepairResponse): CompleteRepairResource =>
    ({
      id: response.id,
      incidentId: response.incidentId,
      workshop: response.workshop,
      cost: response.cost,
      startedAt: response.startedAt,
      finishedAt: response.finishedAt,
      status: response.status,
    }) as CompleteRepairResource;

  /**
   * Converts a complete repair command into the request payload.
   */
  toRequestFromCommand = (command: CompleteRepairCommand): CompleteRepairRequest => ({
    status: 'COMPLETED',
    finishedAt: command.finishedAt,
  });

  /**
   * Converts a response resource into a Repair entity.
   */
  toEntityFromResource = (resource: CompleteRepairResource): Repair =>
    new Repair({
      id: resource.id,
      incidentId: resource.incidentId,
      workshop: resource.workshop,
      cost: resource.cost,
      startedAt: resource.startedAt,
      finishedAt: resource.finishedAt,
      status: resource.status as RepairStatus,
    });
}
