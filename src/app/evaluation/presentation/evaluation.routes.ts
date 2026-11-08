import { Routes } from '@angular/router';

const vehicleStatusBoard = () =>
  import('./views/vehicle-status-board/vehicle-status-board').then((m) => m.VehicleStatusBoard);

export const evaluationRoutes: Routes = [
  { path: '', loadComponent: vehicleStatusBoard, title: 'titles.vehicleStatusBoard' },
];
