import { Component, signal } from '@angular/core';
import { ReportListComponent } from './components/report-list/report-list';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReportListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('fieldReportViewer');
}
