import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ReportService, Report } from '../../services/report.service';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class ReportListComponent {
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef); // cdr injizieren

  // Zustandsvariablen für UX/Stabilität
  loading = false;
  processingIds: Set<string> = new Set();
  reports: Report[] = [];

  constructor(private reportService: ReportService) {
    this.loadReports();
  }


  loadReports() {
    this.loading = true;
    this.reportService.getReports().subscribe({
      next: (data) => {
        this.reports = data ?? [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load reports', err);
        this.loading = false;
        this.cdr.markForCheck();
        this.snackBar.open('Fehler beim Laden der Reports', 'Schließen', { duration: 4000 });
      }
    });
  }

  onHideReport(report: Report) {
    if (!report._id) {
      console.error('Cannot hide report: report id is missing');
      return;
    }
    // Verhindern von Doppelklicks
    if (this.processingIds.has(report._id)) return;
    this.processingIds.add(report._id);

    this.reportService.updateHideReport(report._id, true).subscribe({
      next: (updated) => {
        this.reports = this.reports.filter(r => r._id !== updated._id);
        this.processingIds.delete(report._id);
        this.snackBar.open('Report ausgeblendet', 'OK', { duration: 2500 });
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to hide report', err);
        this.processingIds.delete(report._id);
        this.snackBar.open('Fehler beim Ausblenden des Reports', 'Schließen', { duration: 4000 });
        this.cdr.markForCheck();
      }
    });
  }

  onEditTeam(report: Report) {
    const current = report.team ?? '';
    const team = prompt('Enter team name', current);
    if (team === null) return;
    const trimmed = team.trim();
    if (!trimmed) return;

    if (!report._id) {
      console.error('Cannot update team: report id is missing');
      return;
    }

    this.reportService.updateTeam(report._id, trimmed).subscribe({
      next: () => {
        // lokale UI aktualisieren
        const idx = this.reports.findIndex(r => r._id === report._id);
        if (idx > -1) this.reports[idx] = { ...this.reports[idx], team: trimmed };
        this.snackBar.open('Team aktualisiert', 'OK', { duration: 2500 });
      },
      error: (err) => {
        console.error('Failed to update team', err);
        this.snackBar.open('Fehler beim Aktualisieren des Teams', 'Schließen', { duration: 4000 });
      }
    });
  }
}
