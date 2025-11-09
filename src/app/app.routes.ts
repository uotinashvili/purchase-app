import { Routes } from '@angular/router';
import { SchemaSelectionComponent } from './features/schema-selector/schema-selector.component';

export const routes: Routes = [
  { path: '', redirectTo: 'schemas', pathMatch: 'full' },
  { path: 'schemas', component: SchemaSelectionComponent },
  {
    path: 'request/:schema/section/:section',
    loadComponent: () =>
      import('./features/wizard/wizard').then(m => m.RequestWizardComponent),
  },
  {
    path: 'request/:schema/summary',
    loadComponent: () =>
      import('./features/wizard/wizard-summary/wizard-summary').then(m => m.SummaryComponent),
  },
  { path: '**', redirectTo: 'schemas' }
];
