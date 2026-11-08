import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { IncidentType } from '../domain/model/incident-type.entity';
import { IncidentTypeResource, IncidentTypesResponse } from './incident-types-response';
import { IncidentTypeAssembler } from './incident-type-assembler';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const incidentTypesApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendIncidentTypesEndpointPath}`;

/**
 * Endpoint client for incident type CRUD operations.
 */
export class IncidentTypesApiEndpoint extends BaseApiEndpoint<
  IncidentType,
  IncidentTypeResource,
  IncidentTypesResponse,
  IncidentTypeAssembler
> {
  /**
   * Creates an instance of IncidentTypesApiEndpoint.
   * @param http - The HttpClient to be used for making API requests.
   */
  constructor(http: HttpClient) {
    super(http, incidentTypesApiEndpointUrl, new IncidentTypeAssembler());
  }
}
