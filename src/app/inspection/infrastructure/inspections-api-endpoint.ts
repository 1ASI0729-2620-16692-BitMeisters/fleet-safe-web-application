import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { InspectionResultEntry } from '../domain/model/inspection-result-entry.entity';
import { Inspection } from '../domain/model/inspection.entity';
import { ResultValue } from '../domain/model/result-value.enum';
import { InspectionAssembler } from './inspection-assembler';
import { InspectionResource, InspectionResultResource, InspectionsResponse } from './inspections-response';

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
}
