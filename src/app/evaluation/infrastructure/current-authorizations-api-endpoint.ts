import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { OperationalAuthorization } from '../domain/model/operational-authorization.entity';
import { OperationalAuthorizationAssembler } from './operational-authorization-assembler';
import {
  OperationalAuthorizationResource,
  OperationalAuthorizationsResponse,
} from './operational-authorizations-response';

const currentAuthorizationsApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendOperationalStatusesEndpointPath}`;

export class CurrentAuthorizationsApiEndpoint extends BaseApiEndpoint<
  OperationalAuthorization,
  OperationalAuthorizationResource,
  OperationalAuthorizationsResponse,
  OperationalAuthorizationAssembler
> {
  constructor(http: HttpClient) {
    super(http, currentAuthorizationsApiEndpointUrl, new OperationalAuthorizationAssembler());
  }
}
