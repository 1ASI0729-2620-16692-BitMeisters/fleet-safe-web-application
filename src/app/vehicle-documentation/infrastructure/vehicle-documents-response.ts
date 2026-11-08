import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface VehicleDocumentResource extends BaseResource {
  id: string;
  vehicleId: string;
  documentTypeId: string;
  number: string;
  issueDate: string;
  expirationDate: string;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleDocumentsResponse extends BaseResponse {
  vehicleDocuments: VehicleDocumentResource[];
}
