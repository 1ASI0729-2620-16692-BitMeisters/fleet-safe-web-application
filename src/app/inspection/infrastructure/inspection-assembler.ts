import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Evidence, EvidenceMediaType } from '../domain/model/evidence.entity';
import { InspectionResultEntry } from '../domain/model/inspection-result-entry.entity';
import { InspectionStatus } from '../domain/model/inspection-status.enum';
import { Inspection } from '../domain/model/inspection.entity';
import { ItemCategory } from '../domain/model/item-category.enum';
import { Observation } from '../domain/model/observation.entity';
import { ResultValue } from '../domain/model/result-value.enum';
import {
  EvidenceResource,
  InspectionResource,
  InspectionResultResource,
  InspectionsResponse,
  ObservationResource,
} from './inspections-response';

export class InspectionAssembler implements BaseAssembler<
  Inspection,
  InspectionResource,
  InspectionsResponse
> {
  toEntitiesFromResponse = (response: InspectionsResponse): Inspection[] =>
    response.inspections.map((resource) => this.toEntityFromResource(resource));

  toEntityFromResource = (resource: InspectionResource): Inspection =>
    new Inspection({
      id: resource.id,
      vehicleId: resource.vehicleId,
      driverId: resource.driverId,
      status: resource.status as InspectionStatus,
      odometer: resource.odometer,
      startedAt: new Date(resource.startedAt),
      completedAt: resource.completedAt ? new Date(resource.completedAt) : null,
      results: resource.results.map((result) => this.toResultEntryFromResource(result)),
      createdAt: new Date(resource.createdAt ?? resource.startedAt),
      updatedAt: new Date(resource.updatedAt ?? resource.completedAt ?? resource.startedAt),
    });

  toResourceFromEntity = (entity: Inspection): InspectionResource => ({
    id: entity.id,
    vehicleId: entity.vehicleId,
    driverId: entity.driverId,
    status: entity.status,
    odometer: entity.odometer,
    startedAt: entity.startedAt.toISOString(),
    completedAt: entity.completedAt ? entity.completedAt.toISOString() : null,
    results: entity.results.map((result) => this.toResultResourceFromEntry(result)),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  });

  toResultEntryFromResource = (resource: InspectionResultResource): InspectionResultEntry =>
    new InspectionResultEntry({
      id: resource.id,
      inspectionItemId: resource.inspectionItemId,
      itemName: resource.itemName,
      itemCategory: resource.itemCategory as ItemCategory,
      result: resource.result as ResultValue,
      createdAt: new Date(resource.createdAt ?? Date.now()),
      observations: resource.observations.map((observation) =>
        this.toObservationFromResource(observation),
      ),
    });

  private toObservationFromResource = (resource: ObservationResource): Observation =>
    new Observation({
      id: resource.id,
      description: resource.description,
      createdBy: resource.createdBy,
      createdAt: new Date(resource.createdAt),
      evidences: resource.evidences.map((evidence) => this.toEvidenceFromResource(evidence)),
    });

  private toEvidenceFromResource = (resource: EvidenceResource): Evidence =>
    new Evidence({
      id: resource.id,
      fileUrl: resource.fileUrl,
      mediaType: resource.mediaType as EvidenceMediaType,
      uploadedAt: new Date(resource.uploadedAt),
    });

  private toResultResourceFromEntry = (entry: InspectionResultEntry): InspectionResultResource => ({
    id: entry.id,
    inspectionItemId: entry.inspectionItemId,
    itemName: entry.itemName,
    itemCategory: entry.itemCategory,
    result: entry.result,
    createdAt: entry.createdAt.toISOString(),
    observations: entry.observations.map((observation) => ({
      id: observation.id,
      description: observation.description,
      createdBy: observation.createdBy,
      createdAt: observation.createdAt.toISOString(),
      evidences: observation.evidences.map((evidence) => ({
        id: evidence.id,
        fileUrl: evidence.fileUrl,
        mediaType: evidence.mediaType,
        uploadedAt: evidence.uploadedAt.toISOString(),
      })),
    })),
  });
}
