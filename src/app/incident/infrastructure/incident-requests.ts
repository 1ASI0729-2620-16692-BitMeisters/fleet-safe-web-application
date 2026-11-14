import { IncidentOrigin } from '../domain/model/incident-origin.enum';
import { IncidentSeverity } from '../domain/model/incident-severity.enum';

/**
 * Request payload used to report a new incident.
 */
export interface ReportIncidentRequest {
  vehicleId: string;
  incidentTypeId: string;
  inspectionId: string | null;
  origin: IncidentOrigin;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string;
}

/**
 * Request payload used to update an existing incident.
 */
export interface UpdateIncidentRequest extends ReportIncidentRequest {
  incidentId: string;
}
