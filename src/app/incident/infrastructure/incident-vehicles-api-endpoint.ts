import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { IncidentVehicle } from '../domain/model/incident-vehicle.entity';
import { IncidentVehicleAssembler } from './incident-vehicle-assembler';
import { IncidentVehicleResource, IncidentVehiclesResponse } from './incident-vehicles-response';

const incidentVehiclesApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendVehiclesEndpointPath}`;

export class IncidentVehiclesApiEndpoint extends BaseApiEndpoint<
  IncidentVehicle,
  IncidentVehicleResource,
  IncidentVehiclesResponse,
  IncidentVehicleAssembler
> {
  constructor(http: HttpClient) {
    super(http, incidentVehiclesApiEndpointUrl, new IncidentVehicleAssembler());
  }
}
