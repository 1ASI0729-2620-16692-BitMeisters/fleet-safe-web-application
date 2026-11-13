import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { AssignedVehicle } from '../domain/model/assigned-vehicle.entity';
import { InspectionItem } from '../domain/model/inspection-item.entity';
import { Inspection } from '../domain/model/inspection.entity';
import { InspectionResultEntry } from '../domain/model/inspection-result-entry.entity';
import { ResultValue } from '../domain/model/result-value.enum';
import { Evidence } from '../domain/model/evidence.entity';
import { Observation } from '../domain/model/observation.entity';
import { VehicleOperationalStatus } from '../domain/model/vehicle-operational-status.enum';
import { VehicleStatusApiEndpoint } from './vehicle-status-api-endpoint';
import { AssignedVehicleApiEndpoint } from './assigned-vehicle-api-endpoint';
import { AssignedVehicleAssembler } from './assigned-vehicle-assembler';
import { InspectionItemsApiEndpoint } from './inspection-items-api-endpoint';
import { InspectionsApiEndpoint } from './inspections-api-endpoint';

@Injectable({ providedIn: 'root' })
export class InspectionApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly inspectionsEndpoint = new InspectionsApiEndpoint(this.http);
  private readonly inspectionItemsEndpoint = new InspectionItemsApiEndpoint(this.http);
  private readonly vehicleStatusEndpoint = new VehicleStatusApiEndpoint(this.http);
  private readonly assignedVehicleEndpoint = new AssignedVehicleApiEndpoint(
    this.http,
    new AssignedVehicleAssembler(),
  );

  getInspectionItems = (): Observable<InspectionItem[]> => this.inspectionItemsEndpoint.getAll();

  getInspection = (id: string): Observable<Inspection> => this.inspectionsEndpoint.getById(id);

  createInspection = (inspection: Inspection): Observable<Inspection> =>
    this.inspectionsEndpoint.create(inspection);

  registerResult = (inspectionId: string, inspectionItemId: string, result: ResultValue): Observable<InspectionResultEntry> =>
    this.inspectionsEndpoint.registerResult(inspectionId, inspectionItemId, result);

  updateResult = (inspectionId: string, resultId: string, result: ResultValue): Observable<InspectionResultEntry> =>
    this.inspectionsEndpoint.updateResult(inspectionId, resultId, result);

  addObservation = (inspectionId: string, resultId: string, description: string): Observable<Observation> =>
    this.inspectionsEndpoint.addObservation(inspectionId, resultId, description);

  attachEvidence = (inspectionId: string, observationId: string, photo: File): Observable<Evidence> =>
    this.inspectionsEndpoint.attachEvidence(inspectionId, observationId, photo);

  completeInspection = (inspectionId: string): Observable<Inspection> => this.inspectionsEndpoint.complete(inspectionId);

  getVehicleStatus = (vehicleId: string): Observable<VehicleOperationalStatus> =>
    this.vehicleStatusEndpoint.getStatus(vehicleId);

  getAssignedVehicle = (): Observable<AssignedVehicle> =>
    this.assignedVehicleEndpoint.getAssignedVehicle();
}
