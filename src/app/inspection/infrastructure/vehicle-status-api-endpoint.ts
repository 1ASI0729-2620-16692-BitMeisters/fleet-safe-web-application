import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ErrorHandlingEnabledBaseType } from '../../shared/infrastructure/error-handling-enabled-base-type';
import { VehicleOperationalStatus } from '../domain/model/vehicle-operational-status.enum';

const operationalStatusesApiEndpointUrl = `${environment.backendApiBaseUrl}${environment.backendOperationalStatusesEndpointPath}`;

interface VehicleStatusResponse {
  status: string;
}

export class VehicleStatusApiEndpoint extends ErrorHandlingEnabledBaseType {
  constructor(private http: HttpClient) {
    super();
  }

  getStatus = (vehicleId: string): Observable<VehicleOperationalStatus> =>
    this.http.get<VehicleStatusResponse>(`${operationalStatusesApiEndpointUrl}/${vehicleId}`).pipe(
      map((response) => response.status as VehicleOperationalStatus),
      catchError(this.handleError('Failed to fetch the status of the vehicle')),
    );
}
