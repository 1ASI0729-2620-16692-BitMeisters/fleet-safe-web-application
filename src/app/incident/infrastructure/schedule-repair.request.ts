/**
 * Resource payload sent to schedule a repair.
 */
export interface ScheduleRepairRequest {
  incidentId: string;
  workshop: string;
  cost: number;
  startedAt: string;
  finishedAt: string | null;
}
