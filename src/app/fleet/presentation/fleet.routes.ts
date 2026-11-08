import { Routes } from '@angular/router';

const fleetList = () => import('./views/fleet-list/fleet-list').then((m) => m.FleetList);

const vehicleList = () => import('./views/vehicle-list/vehicle-list').then((m) => m.VehicleList);

const vehicleForm = () => import('./views/vehicle-form/vehicle-form').then((m) => m.VehicleForm);

const vehicleDetail = () =>
  import('./views/vehicle-detail/vehicle-detail').then((m) => m.VehicleDetail);

const driverList = () => import('./views/driver-list/driver-list').then((m) => m.DriverList);

const vehicleAssignment = () =>
  import('./views/vehicle-assignment/vehicle-assignment').then((m) => m.VehicleAssignment);

/**
 * Route tree for Fleet Management views.
 *
 * Route order matters: 'vehicles/new' must precede 'vehicles/:id' so that it is not captured as
 * a vehicle identifier. The overview inherits the title of the parent route.
 */
export const fleetRoutes: Routes = [
  { path: '', loadComponent: fleetList, },
  { path: 'vehicles', loadComponent: vehicleList, title: 'fleet.titles.vehicles', },
  { path: 'vehicles/new', loadComponent: vehicleForm, title: 'fleet.titles.newVehicle', },
  { path: 'vehicles/:id/edit', loadComponent: vehicleForm, title: 'fleet.titles.editVehicle', },
  { path: 'vehicles/:id', loadComponent: vehicleDetail, title: 'fleet.titles.vehicleDetail', },
  { path: 'drivers', loadComponent: driverList, title: 'fleet.titles.drivers', },
  { path: 'assignments', loadComponent: vehicleAssignment, title: 'fleet.titles.assignments', },
];
