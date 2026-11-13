import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource returned by the schedule repair endpoint.
 */
export interface ScheduleRepairResource extends BaseResource {
  id: string;
  incidentId: string;
  workshop: string;
  cost: number;
  startedAt: string;
  finishedAt: string | null;
  status: string;
}

/**
 * Response shape returned by the schedule repair endpoint.
 */
export interface ScheduleRepairResponse extends BaseResponse, ScheduleRepairResource {}
