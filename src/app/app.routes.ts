import { Routes } from '@angular/router';
import { ReportList } from './components/report-list/report-list';


export const routes: Routes = [
  {
    path: '',
    component: ReportList
  },
  { path: '**', redirectTo: '' }
];
