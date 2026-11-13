import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the resolve incident endpoint.
 */
export interface ResolveIncidentResource extends BaseResource {
  id: string;
  vehicleId: string;
  incidentTypeId: string;
  inspectionId: string | null;
  origin: string;
  description: string;
  severity: string;
  status: string;
  reportedBy: string;
  reportedAt: string;
  resolutionType: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response shape returned by the resolve incident endpoint.
 */
export interface ResolveIncidentResponse extends BaseResponse, ResolveIncidentResource {}
