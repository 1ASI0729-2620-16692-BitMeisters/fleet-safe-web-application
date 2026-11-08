import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { OperationalAuthorization } from '../domain/model/operational-authorization.entity';
import { OperationalStatus } from '../domain/model/operational-status.enum';
import {
  OperationalAuthorizationResource,
  OperationalAuthorizationsResponse,
} from './operational-authorizations-response';

export class OperationalAuthorizationAssembler implements BaseAssembler<
  OperationalAuthorization,
  OperationalAuthorizationResource,
  OperationalAuthorizationsResponse
> {
  toEntitiesFromResponse = (response: OperationalAuthorizationsResponse): OperationalAuthorization[] =>
    response.operationalAuthorizations.map((resource) => this.toEntityFromResource(resource));

  toEntityFromResource = (resource: OperationalAuthorizationResource): OperationalAuthorization =>
    new OperationalAuthorization({
      id: resource.id,
      vehicleId: resource.vehicleId,
      status: resource.status as OperationalStatus,
      isOverride: resource.isOverride,
      overrideReason: resource.overrideReason,
      authorizedAt: new Date(resource.authorizedAt),
    });

  toResourceFromEntity = (entity: OperationalAuthorization): OperationalAuthorizationResource => ({
    id: entity.id,
    vehicleId: entity.vehicleId,
    status: entity.status,
    isOverride: entity.isOverride,
    overrideReason: entity.overrideReason,
    authorizedAt: entity.authorizedAt.toISOString(),
  });
}
