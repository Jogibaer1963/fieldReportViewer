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
    });
  }
}
