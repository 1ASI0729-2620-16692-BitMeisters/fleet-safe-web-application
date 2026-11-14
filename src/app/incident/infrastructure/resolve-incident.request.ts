/**
 * Resource payload sent to resolve an incident.
 */
export interface ResolveIncidentRequest {
  status: 'RESOLVED';
  resolutionType: string;
  resolvedAt: string;
}
