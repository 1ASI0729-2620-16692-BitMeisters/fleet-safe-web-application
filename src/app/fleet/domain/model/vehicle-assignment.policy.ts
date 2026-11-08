import { AssignmentViolation } from './assignment-violation.enum';
import type { Driver } from './driver.entity';
import { localDate } from './local-date';
import type { VehicleAssignment } from './vehicle-assignment.entity';
import type { Vehicle } from './vehicle.entity';

/**
 * Domain service that decides whether a vehicle may be assigned to a driver.
 *
 * @remarks
 * The rules guarantee that an assigned vehicle is fit to be inspected: only an enabled vehicle
 * can be handed to a driver whose license is in force, and neither of them may be committed to
 * another active assignment. Rules are checked in order and the first one broken is reported,
 * so the supervisor always sees the most relevant reason.
 */
export class VehicleAssignmentPolicy {
  /**
   * Verifies an assignment before it is registered.
   *
   * @param props.vehicle - Vehicle to assign, if it exists.
   * @param props.driver - Driver receiving the vehicle, if it exists.
   * @param props.assignments - Every known assignment, active or closed.
   * @param props.date - Moment of the assignment; defaults to now.
   * @returns The first rule broken, or `null` when the assignment is allowed.
   */
  static check(props: {
    vehicle: Vehicle | undefined;
    driver: Driver | undefined;
    assignments: readonly VehicleAssignment[];
    date?: Date;
  }): AssignmentViolation | null {
    const { vehicle, driver, assignments, date = new Date() } = props;

    if (!vehicle) return AssignmentViolation.VEHICLE_NOT_FOUND;
    if (!driver) return AssignmentViolation.DRIVER_NOT_FOUND;
    if (!vehicle.isOperational()) return AssignmentViolation.VEHICLE_NOT_ENABLED;
    if (vehicle.getActiveAssignment(assignments, date)) {
      return AssignmentViolation.VEHICLE_ALREADY_ASSIGNED;
    }
    if (!driver.hasValidLicense(localDate(date))) return AssignmentViolation.DRIVER_LICENSE_EXPIRED;
    if (driver.getActiveAssignment(assignments, date)) {
      return AssignmentViolation.DRIVER_ALREADY_ASSIGNED;
    }

    return null;
  }
}
