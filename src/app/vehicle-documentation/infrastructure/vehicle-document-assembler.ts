import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { VehicleDocument } from '../domain/model/vehicle-document.entity';
import { VehicleDocumentResource, VehicleDocumentsResponse } from './vehicle-documents-response';

export class VehicleDocumentAssembler implements BaseAssembler<
  VehicleDocument,
  VehicleDocumentResource,
  VehicleDocumentsResponse
> {
  toEntitiesFromResponse = (response: VehicleDocumentsResponse): VehicleDocument[] =>
    response.vehicleDocuments.map((resource) => this.toEntityFromResource(resource));

  toEntityFromResource = (resource: VehicleDocumentResource): VehicleDocument =>
    new VehicleDocument({
      id: resource.id,
      vehicleId: resource.vehicleId,
      documentTypeId: resource.documentTypeId,
      number: resource.number,
      issueDate: resource.issueDate,
      expirationDate: resource.expirationDate,
      fileUrl: resource.fileUrl ?? '',
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    });

  toResourceFromEntity = (entity: VehicleDocument): VehicleDocumentResource => ({
    id: entity.id,
    vehicleId: entity.vehicleId,
    documentTypeId: entity.documentTypeId,
    number: entity.number,
    issueDate: entity.issueDate,
    expirationDate: entity.expirationDate,
    fileUrl: null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
}
