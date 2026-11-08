import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Fleet } from '../domain/model/fleet.entity';
import { FleetResource, FleetsResponse } from './fleets-response';
import { FleetAssembler } from './fleet-assembler';

export class FleetsApiEndpoint extends BaseApiEndpoint<
  Fleet,
  FleetResource,
  FleetsResponse,
  FleetAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.backendApiBaseUrl}${environment.backendFleetsEndpointPath}`,
      new FleetAssembler(),
    );
  }
}
