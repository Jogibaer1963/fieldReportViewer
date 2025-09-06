import { Component, OnInit } from '@angular/core';
import { ReportService, Report } from '../../services/report.service';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule],
  templateUrl: './report-list.html',
  styleUrls: ['./report-list.css']
})

export class ReportList implements OnInit {
  reports: Report[] = [];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getReports().subscribe(data => {
      this.reports = data;
      console.log(this.reports);
    });
  }

  onEditTeam(report: Report) {
    const current = report.team ?? '';
    const team = prompt('Enter team name', current);
    if (team === null) return; // user cancelled
    const trimmed = team.trim();
    if (!trimmed) return;

    if (!report._id) {
      console.error('Cannot update team: report id is missing');
      return;
    }

    this.reportService.updateTeam(report._id, trimmed).subscribe({
      next: (updated) => {
        // Update the local item to reflect the change without full reload
        report.team = updated.team;
      },
      error: (err) => {
        console.error('Failed to update team', err);
        // Optionally show a UI notification/snackbar here
      }
    });
  }
}

