import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { EvaluatedVehicle } from '../domain/model/evaluated-vehicle.entity';
import { OperationalAuthorization } from '../domain/model/operational-authorization.entity';
import { CurrentAuthorizationsApiEndpoint } from './current-authorizations-api-endpoint';
import { EvaluatedVehiclesApiEndpoint } from './evaluated-vehicles-api-endpoint';

@Injectable({ providedIn: 'root' })
export class EvaluationApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly currentAuthorizationsEndpoint = new CurrentAuthorizationsApiEndpoint(this.http);
  private readonly evaluatedVehiclesEndpoint = new EvaluatedVehiclesApiEndpoint(this.http);

  getCurrentAuthorizations = (): Observable<OperationalAuthorization[]> =>
    this.currentAuthorizationsEndpoint.getAll();

  getVehicles = (): Observable<EvaluatedVehicle[]> => this.evaluatedVehiclesEndpoint.getAll();
}
