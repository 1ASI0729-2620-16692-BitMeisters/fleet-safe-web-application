import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { Driver } from '../domain/model/driver.entity';
import { RegisterDriverCommand } from '../domain/model/register-driver.command';
import { DriverResource, DriversResponse } from './drivers-response';
import { DriverAssembler } from './driver-assembler';
import { failWith } from './fleet-request-error';

export class DriversApiEndpoint extends BaseApiEndpoint<
  Driver,
  DriverResource,
  DriversResponse,
  DriverAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.backendApiBaseUrl}${environment.backendDriversEndpointPath}`,
      new DriverAssembler(),
    );
  }

  /**
   * Registers the license of a user account as a driver of the company.
   * The backend assigns the identifier of the driver.
   */
  register(command: RegisterDriverCommand): Observable<Driver> {
    return this.http
      .post<DriverResource>(this.endpointUrl, {
        userId: command.userId,
        licenseNumber: command.licenseNumber,
        licenseExpirationDate: command.licenseExpirationDate,
      })
      .pipe(
        map((resource) => this.assembler.toEntityFromResource(resource)),
        catchError(failWith('Failed to register driver')),
      );
  }
}
