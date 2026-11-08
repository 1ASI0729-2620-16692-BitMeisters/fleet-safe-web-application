import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { DocumentType } from '../domain/model/document-type.entity';
import { DocumentedVehicle } from '../domain/model/documented-vehicle.entity';
import { VehicleDocument } from '../domain/model/vehicle-document.entity';
import { DocumentTypesApiEndpoint } from './document-types-api-endpoint';
import { DocumentedVehiclesApiEndpoint } from './documented-vehicles-api-endpoint';
import { VehicleDocumentsApiEndpoint } from './vehicle-documents-api-endpoint';

@Injectable({ providedIn: 'root' })
export class VehicleDocumentationApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly vehicleDocumentsEndpoint = new VehicleDocumentsApiEndpoint(this.http);
  private readonly documentTypesEndpoint = new DocumentTypesApiEndpoint(this.http);
  private readonly documentedVehiclesEndpoint = new DocumentedVehiclesApiEndpoint(this.http);

  getVehicleDocuments = (): Observable<VehicleDocument[]> => this.vehicleDocumentsEndpoint.getAll();

  registerVehicleDocument = (document: VehicleDocument): Observable<VehicleDocument> =>
    this.vehicleDocumentsEndpoint.createForVehicle(document);

  updateVehicleDocument = (document: VehicleDocument): Observable<VehicleDocument> =>
    this.vehicleDocumentsEndpoint.updateForVehicle(document);

  getDocumentTypes = (): Observable<DocumentType[]> => this.documentTypesEndpoint.getAll();

  getDocumentedVehicles = (): Observable<DocumentedVehicle[]> =>
    this.documentedVehiclesEndpoint.getAll();
}
