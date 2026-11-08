import { Routes } from '@angular/router';

const startInspection = () =>
  import('./views/start-inspection/start-inspection').then((m) => m.StartInspection);

const inspectionChecklist = () =>
  import('./views/inspection-checklist/inspection-checklist').then((m) => m.InspectionChecklist);

const inspectionSummary = () =>
  import('./views/inspection-summary/inspection-summary').then((m) => m.InspectionSummary);

const inspectionResult = () =>
  import('./views/inspection-result/inspection-result').then((m) => m.InspectionResult);

export const inspectionRoutes: Routes = [
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: 'new', loadComponent: startInspection, title: 'titles.startInspection' },
  {
    path: ':id/execute',
    loadComponent: inspectionChecklist,
    title: 'titles.inspectionChecklist',
  },
  { path: ':id/summary', loadComponent: inspectionSummary, title: 'titles.inspectionSummary' },
  { path: ':id/result', loadComponent: inspectionResult, title: 'titles.inspectionResult' },
];
