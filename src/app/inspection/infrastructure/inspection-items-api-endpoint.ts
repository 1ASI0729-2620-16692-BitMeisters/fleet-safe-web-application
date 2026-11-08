import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { InspectionItem } from '../domain/model/inspection-item.entity';
import { InspectionItemAssembler } from './inspection-item-assembler';
import { InspectionItemResource, InspectionItemsResponse } from './inspection-items-response';

const inspectionItemsApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendInspectionItemsEndpointPath}`;

export class InspectionItemsApiEndpoint extends BaseApiEndpoint<
  InspectionItem,
  InspectionItemResource,
  InspectionItemsResponse,
  InspectionItemAssembler
> {
  constructor(http: HttpClient) {
    super(http, inspectionItemsApiEndpointUrl, new InspectionItemAssembler());
  }
}
