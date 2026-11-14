import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource representation of an incident.
 */
export interface IncidentResource extends BaseResource {
  id: string;
  vehicleId: string;
  incidentTypeId: string;
  inspectionId: string | null;
  origin: string;
  description: string;
  severity: string;
  status: string;
  reportedBy: string;
  reportedByName?: string | null;
  reportedAt: string;
  resolutionType: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  correctiveActions: CorrectiveActionResource[];
  repairs: RepairResource[];
  followUps: IncidentFollowUpResource[];
}

/**
 * Resource representation of a corrective action.
 */
export interface CorrectiveActionResource extends BaseResource {
  id: string;
  incidentId: string;
  description: string;
  performedBy: string;
  performedByName?: string | null;
  performedAt: string;
  evidenceUrl: string | null;
}

/**
 * Resource representation of a repair.
 */
export interface RepairResource extends BaseResource {
  id: string;
  incidentId: string;
  workshop: string;
  cost: number;
  startedAt: string;
  finishedAt: string | null;
  status: string;
}

/**
 * Resource representation of an incident follow-up.
 */
export interface IncidentFollowUpResource extends BaseResource {
  id: string;
  incidentId: string;
  note: string;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
}

/**
 * Response envelope for incident collection queries.
 */
export interface IncidentsResponse extends BaseResponse {
  incidents: IncidentResource[];
}
