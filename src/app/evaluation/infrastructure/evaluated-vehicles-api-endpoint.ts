import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { EvaluatedVehicle } from '../domain/model/evaluated-vehicle.entity';
import { EvaluatedVehicleAssembler } from './evaluated-vehicle-assembler';
import { EvaluatedVehicleResource, EvaluatedVehiclesResponse } from './evaluated-vehicles-response';

const evaluatedVehiclesApiEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehiclesEndpointPath}`;

export class EvaluatedVehiclesApiEndpoint extends BaseApiEndpoint<
  EvaluatedVehicle,
  EvaluatedVehicleResource,
  EvaluatedVehiclesResponse,
  EvaluatedVehicleAssembler
> {
  constructor(http: HttpClient) {
    super(http, evaluatedVehiclesApiEndpointUrl, new EvaluatedVehicleAssembler());
  }
}
