import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BaseApi } from '../../shared/infrastructure/base-api';

import { Company } from '../domain/model/company.entity';
import { Fleet } from '../domain/model/fleet.entity';
import { Vehicle } from '../domain/model/vehicle.entity';
import { Driver } from '../domain/model/driver.entity';
import { VehicleAssignment } from '../domain/model/vehicle-assignment.entity';
import { VehicleInspectionSummary } from '../domain/model/vehicle-inspection-summary.entity';

import { CompaniesApiEndpoint } from './companies-api-endpoint';
import { FleetsApiEndpoint } from './fleets-api-endpoint';
import { VehiclesApiEndpoint } from './vehicles-api-endpoint';
import { DriversApiEndpoint } from './drivers-api-endpoint';
import { VehicleAssignmentsApiEndpoint } from './vehicle-assignments-api-endpoint';
import { VehicleInspectionsApiEndpoint } from './vehicle-inspections-api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class FleetApi extends BaseApi {
  private readonly http = inject(HttpClient);

  private readonly companiesEndpoint = new CompaniesApiEndpoint(this.http);
  private readonly fleetsEndpoint = new FleetsApiEndpoint(this.http);
  private readonly vehiclesEndpoint = new VehiclesApiEndpoint(this.http);
  private readonly driversEndpoint = new DriversApiEndpoint(this.http);
  private readonly assignmentsEndpoint = new VehicleAssignmentsApiEndpoint(this.http);
  private readonly vehicleInspectionsEndpoint = new VehicleInspectionsApiEndpoint(this.http);

  getCompanies(): Observable<Company[]> {
    return this.companiesEndpoint.getMine();
  }

  getFleets(): Observable<Fleet[]> {
    return this.fleetsEndpoint.getAll();
  }

  getVehicles(): Observable<Vehicle[]> {
    return this.vehiclesEndpoint.getAll();
  }

  getVehicle(id: string): Observable<Vehicle> {
    return this.vehiclesEndpoint.getById(id);
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.vehiclesEndpoint.create(vehicle);
  }

  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.vehiclesEndpoint.update(vehicle, vehicle.id);
  }

  getDrivers(): Observable<Driver[]> {
    return this.driversEndpoint.getAll();
  }

  getVehicleAssignments(): Observable<VehicleAssignment[]> {
    return this.assignmentsEndpoint.getAll();
  }

  createVehicleAssignment(assignment: VehicleAssignment): Observable<VehicleAssignment> {
    return this.assignmentsEndpoint.create(assignment);
  }

  updateVehicleAssignment(assignment: VehicleAssignment): Observable<VehicleAssignment> {
    return this.assignmentsEndpoint.update(assignment, assignment.id);
  }

  getVehicleInspections(vehicleId: string): Observable<VehicleInspectionSummary[]> {
    return this.vehicleInspectionsEndpoint.getByVehicleId(vehicleId);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.vehiclesEndpoint.delete(id);
  }
}
