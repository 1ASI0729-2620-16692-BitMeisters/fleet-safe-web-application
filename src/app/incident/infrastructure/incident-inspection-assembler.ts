import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { IncidentInspection } from '../domain/model/incident-inspection.entity';
import {
  IncidentInspectionResource,
  IncidentInspectionsResponse,
} from './incident-inspections-response';

export class IncidentInspectionAssembler implements BaseAssembler<
  IncidentInspection,
  IncidentInspectionResource,
  IncidentInspectionsResponse
> {
  toEntitiesFromResponse = (response: IncidentInspectionsResponse): IncidentInspection[] =>
    response.inspections.map((resource) => this.toEntityFromResource(resource));

  toEntityFromResource = (resource: IncidentInspectionResource): IncidentInspection =>
    new IncidentInspection({
      id: resource.id,
      vehicleId: resource.vehicleId,
      status: resource.status,
      startedAt: resource.startedAt,
    });

  toResourceFromEntity = (entity: IncidentInspection): IncidentInspectionResource => ({
    id: entity.id,
    vehicleId: entity.vehicleId,
    status: entity.status,
    startedAt: entity.startedAt,
  });
}
