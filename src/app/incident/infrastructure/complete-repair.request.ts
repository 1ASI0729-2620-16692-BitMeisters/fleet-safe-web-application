/**
 * Resource payload sent to complete a repair.
 */
export interface CompleteRepairRequest {
  status: 'COMPLETED';
  finishedAt: string;
}
