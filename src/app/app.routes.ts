import { Routes } from '@angular/router';
import { iamGuard } from './iam/infrastructure/iam.guard';
import { Home } from './shared/presentation/views/home/home';

const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const inspectionRoutes = () => import('./inspection/presentation/inspection.routes').then(m => m.inspectionRoutes);
const incidentRoutes = () => import('./incident/presentation/incident.routes').then(m => m.incidentRoutes);
const vehicleDocumentationRoutes = () => import('./vehicle-documentation/presentation/vehicle-documentation.routes').then(m => m.vehicleDocumentationRoutes);
const evaluationRoutes = () => import('./evaluation/presentation/evaluation.routes').then(m => m.evaluationRoutes);
const fleetRoutes = () => import('./fleet/presentation/fleet.routes').then(m => m.fleetRoutes);
const iamRoutes = () => import('./iam/presentation/iam.routes').then(m => m.iamRoutes);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

export const routes: Routes = [
  { path: 'home', component: Home, title: 'titles.home', canActivate: [iamGuard] },
  { path: 'about', loadComponent: about, title: 'titles.about', canActivate: [iamGuard] },
  { path: 'inspections', loadChildren: inspectionRoutes, canActivate: [iamGuard] },
  { path: 'incidents', loadChildren: incidentRoutes, title: 'titles.incidents', canActivate: [iamGuard] },
  { path: 'incident', redirectTo: 'incidents', pathMatch: 'full' },
  { path: 'evaluation', loadChildren: evaluationRoutes, canActivate: [iamGuard] },
  { path: 'fleet', loadChildren: fleetRoutes, title: 'titles.fleet', canActivate: [iamGuard] },
  { path: 'vehicle-documentation', loadChildren: vehicleDocumentationRoutes, canActivate: [iamGuard] },
  { path: 'iam', loadChildren: iamRoutes },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: 'titles.pageNotFound' }
];
