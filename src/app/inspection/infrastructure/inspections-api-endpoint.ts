import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { Evidence } from '../domain/model/evidence.entity';
import { InspectionResultEntry } from '../domain/model/inspection-result-entry.entity';
import { Observation } from '../domain/model/observation.entity';
import { Inspection } from '../domain/model/inspection.entity';
import { ResultValue } from '../domain/model/result-value.enum';
import { InspectionAssembler } from './inspection-assembler';
import {
  EvidenceResource,
  InspectionResource,
  InspectionResultResource,
  InspectionsResponse,
  ObservationResource,
} from './inspections-response';

const inspectionsApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendInspectionsEndpointPath}`;

export class InspectionsApiEndpoint extends BaseApiEndpoint<
  Inspection,
  InspectionResource,
  InspectionsResponse,
  InspectionAssembler
> {
  constructor(http: HttpClient) {
    super(http, inspectionsApiEndpointUrl, new InspectionAssembler());
  }

  registerResult(inspectionId: string, inspectionItemId: string, result: ResultValue): Observable<InspectionResultEntry> {
    return this.http
      .post<InspectionResultResource>(`${inspectionsApiEndpointUrl}/${inspectionId}/results`, { inspectionItemId, result })
      .pipe(
        map((resource) => this.assembler.toResultEntryFromResource(resource)),
        catchError(this.handleError('Failed to save the answer')),
      );
  }

  updateResult(inspectionId: string, resultId: string, result: ResultValue): Observable<InspectionResultEntry> {
    return this.http
      .patch<InspectionResultResource>(`${inspectionsApiEndpointUrl}/${inspectionId}/results/${resultId}`, { result })
      .pipe(
        map((resource) => this.assembler.toResultEntryFromResource(resource)),
        catchError(this.handleError('Failed to save the answer')),
      );
  }

  addObservation(inspectionId: string, resultId: string, description: string): Observable<Observation> {
    return this.http
      .post<ObservationResource>(`${inspectionsApiEndpointUrl}/${inspectionId}/results/${resultId}/observations`, { description })
      .pipe(
        map((resource) => this.assembler.toObservationFromResource(resource)),
        catchError(this.handleError('Failed to save the observation')),
      );
  }

  attachEvidence(inspectionId: string, resultId: string, observationId: string, photo: File): Observable<Evidence> {
    const form = new FormData();
    form.append('file', photo);
    return this.http
      .post<EvidenceResource>(
        `${inspectionsApiEndpointUrl}/${inspectionId}/results/${resultId}/observations/${observationId}/evidences`,
        form,
      )
      .pipe(
        map((resource) => this.assembler.toEvidenceFromResource(resource)),
        catchError(this.handleError('Failed to save the photo')),
      );
  }

  complete(inspectionId: string): Observable<Inspection> {
    return this.http
      .patch<InspectionResource>(`${inspectionsApiEndpointUrl}/${inspectionId}`, { status: 'COMPLETED' })
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(this.handleError('Failed to submit the inspection')),
      );
  }
}
