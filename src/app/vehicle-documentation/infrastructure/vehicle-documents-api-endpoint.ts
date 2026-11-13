import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { VehicleDocument } from '../domain/model/vehicle-document.entity';
import { VehicleDocumentAssembler } from './vehicle-document-assembler';
import { VehicleDocumentResource, VehicleDocumentsResponse } from './vehicle-documents-response';

const vehicleDocumentsApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendDocumentsEndpointPath}`;
const vehiclesApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendVehiclesEndpointPath}`;

export class VehicleDocumentsApiEndpoint extends BaseApiEndpoint<
  VehicleDocument,
  VehicleDocumentResource,
  VehicleDocumentsResponse,
  VehicleDocumentAssembler
> {
  constructor(http: HttpClient) {
    super(http, vehicleDocumentsApiEndpointUrl, new VehicleDocumentAssembler());
  }

  createForVehicle(document: VehicleDocument): Observable<VehicleDocument> {
    return this.http
      .post<VehicleDocumentResource>(
        `${vehiclesApiEndpointUrl}/${document.vehicleId}/documents`,
        this.assembler.toResourceFromEntity(document),
      )
      .pipe(
        map((created) => this.assembler.toEntityFromResource(created)),
        catchError(this.handleError('Failed to create entity')),
      );
  }

  updateForVehicle(document: VehicleDocument): Observable<VehicleDocument> {
    return this.http
      .put<VehicleDocumentResource>(
        `${vehiclesApiEndpointUrl}/${document.vehicleId}/documents/${document.id}`,
        this.assembler.toResourceFromEntity(document),
      )
      .pipe(
        map((updated) => this.assembler.toEntityFromResource(updated)),
        catchError(this.handleError('Failed to update entity')),
      );
  }

  attachFile(document: VehicleDocument, file: File): Observable<VehicleDocument> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<VehicleDocumentResource>(
        `${vehicleDocumentsApiEndpointUrl}/${document.id}/files`,
        form,
      )
      .pipe(
        map((updated) => this.assembler.toEntityFromResource(updated)),
        catchError(this.handleError('Failed to attach the file of the document')),
      );
  }
}
