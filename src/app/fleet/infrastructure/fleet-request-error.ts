import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

/**
 * Failure of a request to the platform backend that keeps the HTTP status, so the application
 * layer can tell a rejected rule (409, 422) from a network problem.
 */
export class FleetRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'FleetRequestError';
  }
}

/**
 * Builds the error handler of an operation, to be used in `catchError`.
 *
 * @param operation - Description of the failed operation.
 */
export const failWith =
  (operation: string) =>
  (error: HttpErrorResponse): Observable<never> =>
    throwError(() => new FleetRequestError(error.status, `${operation}: ${error.status}`));
