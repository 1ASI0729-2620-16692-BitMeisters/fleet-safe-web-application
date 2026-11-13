/**
 * Request payload used to move an incident to review.
 */
export interface UpdateIncidentStatusRequest {
  incidentId: string;
  status: 'IN_REVIEW';
}
