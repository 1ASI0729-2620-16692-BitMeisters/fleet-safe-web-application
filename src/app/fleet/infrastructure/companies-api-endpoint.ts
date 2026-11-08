import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Company } from '../domain/model/company.entity';
import { CompanyResource, CompaniesResponse } from './companies-response';
import { CompanyAssembler } from './company-assembler';

export class CompaniesApiEndpoint extends BaseApiEndpoint<
  Company,
  CompanyResource,
  CompaniesResponse,
  CompanyAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.backendApiBaseUrl}${environment.backendCompaniesEndpointPath}`,
      new CompanyAssembler(),
    );
  }

  getMine(): Observable<Company[]> {
    return this.http.get<CompanyResource>(`${this.endpointUrl}/me`).pipe(
      map((resource) => [this.assembler.toEntityFromResource(resource)]),
      catchError(this.handleError('Failed to fetch the company')),
    );
  }
}
